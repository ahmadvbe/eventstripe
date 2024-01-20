'use server' //as here we re gonna have server actions

import { revalidatePath } from 'next/cache'

import { connectToDatabase } from '@/lib/database'
import Event from '@/lib/database/models/event.model'
import User from '@/lib/database/models/user.model'
import Category from '@/lib/database/models/category.model'
import { handleError } from '@/lib/utils'

import {
  CreateEventParams,
  UpdateEventParams,
  DeleteEventParams,
  GetAllEventsParams,
  GetEventsByUserParams,
  GetRelatedEventsByCategoryParams,
} from '@/types'

const getCategoryByName = async (name: string) => {
  return Category.findOne({ name: { $regex: name, $options: 'i' } })
}

const populateEvent = (query: any) => {//union , and we choose which parameters to be joint all together
  return query
    .populate({ path: 'organizer', model: User, select: '_id firstName lastName' })
    .populate({ path: 'category', model: Category, select: '_id name' })
}

// CREATE
//export const createvent = async ({event, userId, path}:CreateEventParams)=>{}
export async function createEvent({ userId, event, path }: CreateEventParams) {//path to revalidate
  try {
    await connectToDatabase()
      //1st we hve to figure out who is the organizer of this event
    const organizer = await User.findById(userId)//among all the registered users we specified the one liable for this event whom is called organizer
    //and this organizer guy will have the parameters of the User Model
    console.log({
      organizer: organizer,
      categoryid: event.categoryId,
      organizerid: userId
      })
    if (!organizer) throw new Error('Organizer not found')
    
    const newEvent = await Event.create({
          ...event,
          category: event.categoryId,
          organizer: userId
         })

    revalidatePath(path)

    return JSON.parse(JSON.stringify(newEvent))
  } catch (error) {
    handleError(error)
    console.log(error)
  }
}

// GET ONE EVENT BY ID
export async function getEventById(eventId: string) {
  try {
    await connectToDatabase()

    const event = await populateEvent(Event.findById(eventId)) //we found the event and we collected its info and we added 2 sub tables 
    // for the path 'category' and 'organizer' respectively 
    //'organizer': {_id, firstName, lastName}
    //'category : {_id, name}

    if (!event) throw new Error('Event not found')
    
    return JSON.parse(JSON.stringify(event))
  } catch (error) {
    handleError(error)
  }
}

// UPDATE
export async function updateEvent({ userId, event, path }: UpdateEventParams) {
  try {
    await connectToDatabase()

    const eventToUpdate = await Event.findById(event._id)
    if (!eventToUpdate || eventToUpdate.organizer.toHexString() !== userId) {
      throw new Error('Unauthorized or event not found')
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      { ...event, category: event.categoryId },
      { new: true }
    )
    revalidatePath(path)

    return JSON.parse(JSON.stringify(updatedEvent))
  } catch (error) {
    handleError(error)
  }
}

// DELETE
//export const deleteEvents = async ({eventId, path}: DeleteEventParams){}
export async function deleteEvent({ eventId, path }: DeleteEventParams) {
  //we cnt to Db or we handle some errors 
  //and after cnx to DB we try to delete the data 
  try {
    await connectToDatabase()

    const deletedEvent = await Event.findByIdAndDelete(eventId)
    if (deletedEvent) revalidatePath(path) //clear the cach and refetch all the events bcz event structure has changed  
    //we dnt need t return antg in this case other than refetching the events as above mentioned  
  } catch (error) {
    handleError(error)
  }
}

// GET ALL EVENTS
export async function getAllEvents({ query, limit = 6, page, category }: GetAllEventsParams) {
  try {
    await connectToDatabase()
    //we wana implement all the queries before fetching the events
    const titleCondition = query ? { title: { $regex: query, $options: 'i' } } : {}
    const categoryCondition = category ? await getCategoryByName(category) : null
    const conditions = {
      $and: [titleCondition, categoryCondition ? { category: categoryCondition._id } : {}],
    }

    const skipAmount = (Number(page) - 1) * limit
    const eventsQuery = Event.find(conditions)//It uses these conditions to fetch events from the database, applying sorting, skipping, and limiting based on pagination parameters.
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = await populateEvent(eventsQuery)//It populates the fetched events with additional data using the populateEvent function.
    const eventsCount = await Event.countDocuments(conditions)//total number of events so we can implement pagination
    //It counts the total number of events satisfying the conditions for implementing pagination.

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),//top number .ceil
    }
  } catch (error) {
    handleError(error)
  }
}

// GET EVENTS BY ORGANIZER
export async function getEventsByUser({ userId, limit = 6, page }: GetEventsByUserParams) {
  try {
    await connectToDatabase()

    const conditions = { organizer: userId }
    const skipAmount = (page - 1) * limit

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditions)

    return { data: JSON.parse(JSON.stringify(events)), totalPages: Math.ceil(eventsCount / limit) }
  } catch (error) {
    handleError(error)
  }
}

// GET RELATED EVENTS: EVENTS WITH SAME CATEGORY
export async function getRelatedEventsByCategory({
  categoryId,
  eventId,
  limit = 3,
  page = 1,
}: GetRelatedEventsByCategoryParams) {
  try {
    await connectToDatabase()

    const skipAmount = (Number(page) - 1) * limit
    const conditions = { $and: [{ category: categoryId }, { _id: { $ne: eventId } }] }

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditions)

    return { data: JSON.parse(JSON.stringify(events)), totalPages: Math.ceil(eventsCount / limit) }
  } catch (error) {
    handleError(error)
  }
}
