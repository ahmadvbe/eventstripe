"use client"

import { IEvent } from '@/lib/database/models/event.model'
import { SignedIn, SignedOut, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import Checkout from './Checkout'


const CheckoutButton = ({ event }: { event: IEvent }) => {//we accept the event passed
  const { user } = useUser(); //in this case we wont be using the claims to know who purchased it bcz this button will be a client component
  //so we define it as use client above, so we use useUser() coming from clerk next js==>give us access to the userId
  const userId = user?.publicMetadata.userId as string;
  const hasEventFinished = new Date(event.endDateTime) < new Date(); //is the event end time due before the daily date to see if we can still participate

  return (
    <div className="flex items-center gap-3">
      {/* we cannot buy passed event */}
      {hasEventFinished ? (
        <p className="p-2 text-red-400">Sorry, tickets are no longer available.</p>
      ): ( //to purchase an event we need to be logged in ==>use of nextjs/clerk signedout and signedin components
        <>
          <SignedOut>  
                     {/* button has ASCHILD PROPERTY SINCE ITS RENDERING A LINK */}
            <Button asChild className="button rounded-full" size="lg">
              <Link href="/sign-in">
                Get Tickets
              </Link>
            </Button>
          </SignedOut>

          <SignedIn>
            {/* HERE WE RE GONNA RENDER AN ENTIRE COMPONENT TO PROCESS THE CHECKOUT */}
            <Checkout event={event} userId={userId} />
          </SignedIn>
        </>
      )}
    </div>
  )
}

export default CheckoutButton