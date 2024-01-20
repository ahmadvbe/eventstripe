import stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createOrder } from '@/lib/actions/order.actions' //this is going to turn a strip successful checkout order into a doc into our DB

export async function POST(request: Request) { //post req which is gonna be triggered by the webhook
  //as soon as our order is paid stripe is gonna ping our endpoint and provide us with info through the const body
  const body = await request.text()
  //we get the signature for stripe
  const sig = request.headers.get('stripe-signature') as string
  //we hve the secret
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

  //then we listen for a specific event type

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    return NextResponse.json({ message: 'Webhook error', error: err })
  }

  // Get the ID and type
  const eventType = event.type

  // CREATE
  if (eventType === 'checkout.session.completed') {
    const { id, amount_total, metadata } = event.data.object

    const order = {
      stripeId: id,
      eventId: metadata?.eventId || '',
      buyerId: metadata?.buyerId || '',
      totalAmount: amount_total ? (amount_total / 100).toString() : '0',
      createdAt: new Date(),
    }
      //once the order is gathered we give to the DB through the createOrder action
    const newOrder = await createOrder(order)
    return NextResponse.json({ message: 'OK', order: newOrder })
  }

  return new Response('', { status: 200 })
}
