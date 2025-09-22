#!/usr/bin/env python3
import os
import sys
import json
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage, FileContentWithMimeType
except ImportError as e:
    print(json.dumps({"success": False, "error": f"Failed to import emergentintegrations: {str(e)}"}))
    sys.exit(1)

async def extract_medicines_from_prescription(file_path: str, mime_type: str):
    """
    Extract medicine information from prescription using Emergent LLM
    """
    try:
        # Get the API key from environment
        api_key = os.getenv('EMERGENT_LLM_KEY')
        if not api_key:
            return {
                "success": False,
                "error": "EMERGENT_LLM_KEY not found in environment variables"
            }

        # Check if file exists
        if not os.path.exists(file_path):
            return {
                "success": False,
                "error": f"File not found: {file_path}"
            }

        # Initialize the chat with GPT-4o for best OCR performance
        chat = LlmChat(
            api_key=api_key,
            session_id="prescription_ocr_" + str(hash(file_path)),
            system_message="""You are a medical prescription OCR expert. Analyze the prescription image/document and extract medicine information accurately.

Extract the following information for each medicine:
1. Medicine name (exact spelling)
2. Dosage (strength/concentration)
3. Frequency (how often to take)
4. Duration (how long to take)
5. Instructions (special notes like "after meals", "before sleep", etc.)

Return the data in this exact JSON format:
{
  "medicines": [
    {
      "name": "Medicine Name",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "5 days",
      "instructions": "Take after meals"
    }
  ],
  "extractedText": "Full extracted text from prescription"
}

Be very careful with medicine names - they must be spelled correctly. If you're unsure about a medicine name, include it anyway but add a note in instructions.
If the prescription is unclear or you cannot read certain parts, mention this in the extractedText field."""
        ).with_model("openai", "gpt-4o")

        # Create file content for image analysis
        file_content = FileContentWithMimeType(
            file_path=file_path,
            mime_type=mime_type
        )

        # Create user message
        user_message = UserMessage(
            text="Please analyze this prescription and extract all medicine information. Return only the JSON response as specified.",
            file_contents=[file_content]
        )

        # Send the message and get response
        response = await chat.send_message(user_message)
        
        # Try to parse the JSON response
        try:
            # Clean the response - remove markdown formatting if present
            clean_response = response.strip()
            if clean_response.startswith('```json'):
                clean_response = clean_response[7:]
            if clean_response.endswith('```'):
                clean_response = clean_response[:-3]
            clean_response = clean_response.strip()
            
            ocr_data = json.loads(clean_response)
            
            return {
                "success": True,
                "medicines": ocr_data.get("medicines", []),
                "extractedText": ocr_data.get("extractedText", response)
            }
            
        except json.JSONDecodeError:
            # If JSON parsing fails, return the raw response
            return {
                "success": True,
                "medicines": [],
                "extractedText": response,
                "note": "Could not parse structured data, raw OCR response provided"
            }

    except Exception as e:
        return {
            "success": False,
            "error": f"OCR processing failed: {str(e)}"
        }

async def main():
    if len(sys.argv) != 3:
        print(json.dumps({"success": False, "error": "Usage: python ocr_processor.py <file_path> <mime_type>"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    mime_type = sys.argv[2]
    
    result = await extract_medicines_from_prescription(file_path, mime_type)
    print(json.dumps(result))

if __name__ == "__main__":
    asyncio.run(main())