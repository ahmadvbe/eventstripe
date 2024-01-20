'use server' //as here we re gonna have server actions

import { revalidatePath } from 'next/cache'

import { connectToDatabase } from '@/lib/database'
import User from '@/lib/database/models/user.model'
import Order from '@/lib/database/models/order.model'
import Event from '@/lib/database/models/event.model'
import { handleError } from '@/lib/utils'

import { CreateUserParams, UpdateUserParams } from '@/types'

export async function createUser(user: CreateUserParams) {
  try {
    const cnx = await connectToDatabase();

    if (!cnx) {
      console.error('Database connection not established');
      return new Response('Internal Server Error', {
        status: 500
      });
    }

    const newUser = await User.create(user);
    console.log(newUser.toObject()); // Use .toObject() to convert to a plain JavaScript object
    return new Response('User created successfully', {
      status: 200
    });
  } catch (error: any) { // Explicitly type 'error' as 'any'
    console.error('Error creating user:', error);
    return new Response(`User creation failed: ${error.message}`, {
      status: 400
    });
    // handleError(error)
  }
}

export async function getUserById(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) throw new Error('User not found');
    return user ? user.toObject() : null; // Use .toObject() to convert to a plain JavaScript object
  } catch (error) {
    handleError(error);
  }
}

export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, { new: true });

    if (!updatedUser) throw new Error('User update failed');
    return updatedUser.toObject(); // Use .toObject() to convert to a plain JavaScript object
  } catch (error) {
    handleError(error);
  }
}

export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();

    // Find user to delete
    const userToDelete = await User.findOne({ clerkId });

    if (!userToDelete) {
      throw new Error('User not found');
    }

    // Unlink relationships
    await Promise.all([
      // delete all the events of that user
      // Update the 'events' collection to remove references to the user
      Event.updateMany(
        { _id: { $in: userToDelete.events } },
        { $pull: { organizer: userToDelete._id } }
      ),
      // delete all of the user orders
      // Update the 'orders' collection to remove references to the user
      Order.updateMany({ _id: { $in: userToDelete.orders } }, { $unset: { buyer: 1 } }),
    ]);

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath('/');

    return deletedUser ? deletedUser.toObject() : null; // Use .toObject() to convert to a plain JavaScript object
  } catch (error) {
    handleError(error);
  }
}