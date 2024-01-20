import { IEvent } from '@/lib/database/models/event.model'
import { formatDateTime } from '@/lib/utils'
import { auth } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { DeleteConfirmation } from './DeleteConfirmation'


type CardProps = {
  event: IEvent,
  hasOrderLink?: boolean,
  hidePrice?: boolean
}

const Card = ({ event, hasOrderLink, hidePrice }: CardProps) => {
  const { sessionClaims } = auth();
  //is the userId of the logged in user the same as the userId of the organizer of that event 
  const userId = sessionClaims?.userId as string;//the logged in user

  const isEventCreator = userId === event.organizer._id.toString();//booleach where we check if userId ===, .toString() smetimes the id is the mongodb object Id
  //we want it to be a string becz we re doing a string comparison

  return (
    <div className="group relative flex min-h-[380px] w-full max-w-[400px] flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg md:min-h-[438px]">
      <Link 
        href={`/events/${event._id}`}
        style={{backgroundImage: `url(${event.imageUrl})`}}
        className="flex-center flex-grow bg-gray-50 bg-cover bg-center text-grey-500"
      />

              {/* IS EVENT CREATOR if we re the creator of the event we can add additional func... */}
      {isEventCreator && !hidePrice && (//then we want to show smtg
        <div className="absolute right-2 top-2 flex flex-col gap-4 rounded-xl bg-white p-3 shadow-sm transition-all">
          <Link href={`/events/${event._id}/update`}>
            <Image src="/assets/icons/edit.svg" alt="edit" width={20} height={20} />
          </Link>

          <DeleteConfirmation eventId={event._id} />
        </div>
      )}

      <div   //it was a link before but becz we cant nest different elements inside a link which is the case below
      //we shifted it to the below event.title so once we click on it 
        className="flex min-h-[230px] flex-col gap-3 p-5 md:gap-4"
      > 
       {!hidePrice && <div className="flex gap-2">
          <span className="p-semibold-14 w-min rounded-full bg-green-100 px-4 py-1 text-green-60">
            {event.isFree ? 'FREE' : `$${event.price}`}
          </span>
            {/* line-clamp-1 make it fits in 1 line */}
          <p className="p-semibold-14 w-min rounded-full bg-grey-500/10 px-4 py-1 text-grey-500 line-clamp-1">
            {event.category.name}
          </p>
        </div>}

        <p className="p-medium-16 p-medium-18 text-grey-500">
          {formatDateTime(event.startDateTime).dateTime}
        </p>
              
        <Link href={`/events/${event._id}`}>
          <p className="p-medium-16 md:p-medium-20 line-clamp-2 flex-1 text-black">{event.title}</p>
        </Link>

        <div className="flex-between w-full">
          <p className="p-medium-14 md:p-medium-16 text-grey-600">
            {event.organizer.firstName} {event.organizer.lastName}
          </p>

          {hasOrderLink && ( //have we bought this event already
            <Link href={`/orders?eventId=${event._id}`} className="flex gap-2">
              <p className="text-primary-500">Order Details</p>
              <Image src="/assets/icons/arrow.svg" alt="search" width={10} height={10} />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Card