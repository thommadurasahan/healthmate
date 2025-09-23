import nodemailer from 'nodemailer'
import { prisma } from './db'

export interface NotificationData {
  userId: string
  type: 'ORDER_UPDATE' | 'APPOINTMENT_REMINDER' | 'LAB_REPORT_READY' | 'DELIVERY_UPDATE' | 'PAYMENT_CONFIRMATION' | 'SYSTEM_ALERT'
  title: string
  message: string
  metadata?: any
}

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

/**
 * Create a notification in the database
 */
export async function createNotification(data: NotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      }
    })
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

/**
 * Send email notification
 */
export async function sendEmailNotification(emailData: EmailData) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Email not configured, skipping email notification')
      return null
    }

    const info = await transporter.sendMail({
      from: `"HealthMate" <${process.env.SMTP_USER}>`,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
    })

    console.log('Email sent:', info.messageId)
    return info
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

/**
 * Notify user about order updates
 */
export async function notifyOrderUpdate(orderId: string, status: string, userEmail: string) {
  const emailTemplate = getOrderUpdateEmailTemplate(orderId, status)
  
  await Promise.all([
    createNotification({
      userId: await getUserIdByEmail(userEmail),
      type: 'ORDER_UPDATE',
      title: 'Order Update',
      message: `Your order ${orderId} status has been updated to ${status}`,
      metadata: { orderId, status }
    }),
    sendEmailNotification({
      to: userEmail,
      subject: `Order Update - ${orderId}`,
      html: emailTemplate,
    })
  ])
}

/**
 * Notify user about appointment reminders
 */
export async function notifyAppointmentReminder(appointmentId: string, userEmail: string, doctorName: string, scheduledAt: Date) {
  const emailTemplate = getAppointmentReminderEmailTemplate(appointmentId, doctorName, scheduledAt)
  
  await Promise.all([
    createNotification({
      userId: await getUserIdByEmail(userEmail),
      type: 'APPOINTMENT_REMINDER',
      title: 'Appointment Reminder',
      message: `You have an appointment with Dr. ${doctorName} at ${scheduledAt.toLocaleString()}`,
      metadata: { appointmentId, doctorName, scheduledAt }
    }),
    sendEmailNotification({
      to: userEmail,
      subject: 'Appointment Reminder',
      html: emailTemplate,
    })
  ])
}

/**
 * Notify user about lab report ready
 */
export async function notifyLabReportReady(labBookingId: string, userEmail: string, testName: string) {
  const emailTemplate = getLabReportReadyEmailTemplate(labBookingId, testName)
  
  await Promise.all([
    createNotification({
      userId: await getUserIdByEmail(userEmail),
      type: 'LAB_REPORT_READY',
      title: 'Lab Report Ready',
      message: `Your ${testName} test results are ready for download`,
      metadata: { labBookingId, testName }
    }),
    sendEmailNotification({
      to: userEmail,
      subject: 'Lab Report Ready',
      html: emailTemplate,
    })
  ])
}

/**
 * Notify user about delivery updates
 */
export async function notifyDeliveryUpdate(orderId: string, status: string, userEmail: string, deliveryPartnerName?: string) {
  const emailTemplate = getDeliveryUpdateEmailTemplate(orderId, status, deliveryPartnerName)
  
  await Promise.all([
    createNotification({
      userId: await getUserIdByEmail(userEmail),
      type: 'DELIVERY_UPDATE',
      title: 'Delivery Update',
      message: `Your order ${orderId} delivery status: ${status}`,
      metadata: { orderId, status, deliveryPartnerName }
    }),
    sendEmailNotification({
      to: userEmail,
      subject: `Delivery Update - ${orderId}`,
      html: emailTemplate,
    })
  ])
}

/**
 * Get user ID by email
 */
async function getUserIdByEmail(email: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  })
  return user?.id || ''
}

/**
 * Email templates
 */
function getOrderUpdateEmailTemplate(orderId: string, status: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Order Update - HealthMate</h2>
      <p>Your order <strong>${orderId}</strong> has been updated.</p>
      <p><strong>New Status:</strong> ${status}</p>
      <p>You can track your order progress in your dashboard.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/patient/orders" 
         style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        View Order Details
      </a>
      <p style="margin-top: 20px; color: #666;">Thank you for using HealthMate!</p>
    </div>
  `
}

function getAppointmentReminderEmailTemplate(appointmentId: string, doctorName: string, scheduledAt: Date): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Appointment Reminder - HealthMate</h2>
      <p>This is a reminder for your upcoming appointment:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
        <p><strong>Date & Time:</strong> ${scheduledAt.toLocaleString()}</p>
      </div>
      <p>Please be ready 5 minutes before your scheduled time.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/patient/consultations" 
         style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Join Consultation
      </a>
      <p style="margin-top: 20px; color: #666;">Thank you for using HealthMate!</p>
    </div>
  `
}

function getLabReportReadyEmailTemplate(labBookingId: string, testName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Lab Report Ready - HealthMate</h2>
      <p>Your lab test results are now available for download:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p><strong>Test:</strong> ${testName}</p>
        <p><strong>Booking ID:</strong> ${labBookingId}</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/patient/labs" 
         style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Download Report
      </a>
      <p style="margin-top: 20px; color: #666;">Thank you for using HealthMate!</p>
    </div>
  `
}

function getDeliveryUpdateEmailTemplate(orderId: string, status: string, deliveryPartnerName?: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Delivery Update - HealthMate</h2>
      <p>Your order delivery status has been updated:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Status:</strong> ${status}</p>
        ${deliveryPartnerName ? `<p><strong>Delivery Partner:</strong> ${deliveryPartnerName}</p>` : ''}
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/patient/orders" 
         style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Track Order
      </a>
      <p style="margin-top: 20px; color: #666;">Thank you for using HealthMate!</p>
    </div>
  `
}