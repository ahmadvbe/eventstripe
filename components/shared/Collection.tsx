import { IEvent } from '@/lib/database/models/event.model'
import React from 'react'
import Card from './Card'
// import Card from './Card'
// import Pagination from './Pagination'

type CollectionProps = {
  data: IEvent[],//event interface  
  emptyTitle: string,
  emptyStateSubtext: string,
  limit: number,
  page: number | string,
  totalPages?: number,
  urlParamName?: string,
  collectionType?: 'Events_Organized' | 'My_Tickets' | 'All_Events'
}

const Collection = ({
  data,
  emptyTitle,
  emptyStateSubtext,
  page,
  totalPages = 0,
  collectionType,
  urlParamName,
}: CollectionProps) => {
  return (
    <>
      {data.length > 0 ? (//check if we hvae smtg within our data
        <div className="flex flex-col items-center gap-10">
          <ul className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
            {data.map((event) => {//check wheyher we r on the orgaanized events or my tickets
              const hasOrderLink = collectionType === 'Events_Organized';//conditions only if ===
              const hidePrice = collectionType === 'My_Tickets';

              return (
                <li key={event._id} className="flex justify-center">
                  <Card event={event} hasOrderLink={hasOrderLink} hidePrice={hidePrice} />
                </li>
              )
            })}
          </ul>

          {/* {totalPages > 1 && (
            // <Pagination urlParamName={urlParamName} page={page} totalPages={totalPages} />
          )
          } */}
        </div>
      ): (//if no data exists
        <div className="flex-center wrapper min-h-[200px] w-full flex-col gap-3 rounded-[14px] bg-grey-50 py-28 text-center">
          <h3 className="p-bold-20 md:h5-bold">{emptyTitle}</h3>
          <p className="p-regular-14">{emptyStateSubtext}</p>
        </div>
      )} 
    </>
  )
}

export default Collection