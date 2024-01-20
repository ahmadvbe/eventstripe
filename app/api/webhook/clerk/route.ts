import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions'
import { clerkClient } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/database'
import User from '@/lib/database/models/user.model'

export async function POST(request: Request) {

  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }
  const payload: WebhookEvent = await request.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;
  try {
    // Commenting out the verification block
    // evt = wh.verify(body, {
    //   "svix-id": svix_id,
    //   "svix-timestamp": svix_timestamp,
    // }) as WebhookEvent;
  
    // If you're skipping verification, you can assign evt directly from payload
    evt = payload;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred during webhook verification', {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;
 
  if (eventType === 'user.created') {
    const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;
  
    const user = {
      clerkId: id,
      email: email_addresses[0].email_address,
      username: username!,
      firstName: first_name,
      lastName: last_name,
      photo: image_url,
    };
  
    try {
      //const newUser = await createUser(user);
      const cnx = await connectToDatabase();
      const newUser = await User.create(user);
      // if (newUser) {
      //   let userinfo = '';
      //   Object.entries(newUser).forEach(([name, value]) => {
      //     userinfo += `${name}: ${value}\n`;
      //   });
      if (newUser) {
        const clerkClientResponse = await clerkClient.users.updateUserMetadata(id, {
          publicMetadata: {
                userId: newUser._id
              }
            })
        //getUserList()
        // let chainString = '';
        
        // Object.entries(clerkClientResponse).forEach(([name, value]) => {
        //   chainString += `${name}: ${value}\n`;
        // });
          // clerkClientResponse.forEach((value, name) => {
            
          //   chainString += `${name}: ${value}\n`;
          // });
        //getUser(newUser.clerkId)
        // updateUserMetadata(id, {
        //   publicMetadata: {
        //     userId: newUser._id
        //   }
        // });
        
    
        const { _id, clerkId, email, username, firstName, lastName, photo } = newUser.toObject();
        let userinfo = `
          _id: ${_id},
          clerkId: ${clerkId},
          email: ${email},
          username: ${username},
          firstName: ${firstName},
          lastName: ${lastName},
          photo: ${photo}
        `;

        let clerkClientDetails = `lerk Client Details: Response: ${JSON.stringify(clerkClientResponse)} `;
        // let chainString = '';
        
        // Object.entries(clerkClientDetails).forEach(([name, value]) => {
        //   chainString += `${name}: ${value}\n`;
        // });


        // let responseMessage = `Headers: ${id}, user created with the following details:\n${userinfo}\nclerk details retrieved${clerkClientDetails}`;
        // return new Response(responseMessage, {
        //   status: 200
        // });
        return NextResponse.json({ message: 'OK', user: newUser })

      } else {
        return new Response(`Headers: ${id}, user wasn't created in DB`, {
          status: 400
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      return new Response(`Internal Server Error ${error}`, {
        status: 500
      });
    }
  }

  if (eventType === 'user.updated') {
    const {id, image_url, first_name, last_name, username } = evt.data

    const user = {
      firstName: first_name,
      lastName: last_name,
      username: username!,
      photo: image_url,
    }
    try{
    const updatedUser = await updateUser(id, user)
    //the following is done in order to assure that the metadata change required during the user creation to be done at clerk db side is done successfully
              // const clerkClientResponse = await clerkClient.users.getUser(id)
              // let clerkClientDetails = `lerk Client Details: Response: ${JSON.stringify(clerkClientResponse)} `;
              // return new Response(clerkClientDetails, {
              //       status: 200
              //     });
    
     return NextResponse.json({ message: 'OK', user: updatedUser })
      }catch(error){
        return new Response('Error occurred during update', {
          status: 400
        });
      }
    //return NextResponse.json({ message: 'OK', user: updatedUser })
  }



  if (eventType === 'user.deleted') {
    const { id } = evt.data

    try{
    const deletedUser = await deleteUser(id!)
    // return new Response('user deleted', {
    //   status: 200
    // });
    return NextResponse.json({ message: 'OK', user: deletedUser })
    }catch(error){
        return new Response('Error occurred during deletion', {
      status: 400
    });
    }
    //return NextResponse.json({ message: 'OK', user: deletedUser })
  }
 
  return new Response('', { status: 200 })
}

//comands in order to try with curl
//curl is done to simulate the work of clerk platform but we re sending the request by command line
  //typical example for update with curl
  // curl -X POST -H "Content-Type: application/json" -d '{"type": "user.updated", "data": {"id": "123", "email_addresses": [{"email_address": "user@example.com"}], "image_url": "https://example.com/image.jpg", "first_name": "John", "last_name": "Doe", "username": "johndoe"}}' https://jsmmm.vercel.app/api/webhook/clerk 
  //example// curl -X POST -H "Content-Type: application/json" -d '{"type": "user.updated, "data": {"id": "user_2b9jFzv5ZeKXSHpGndMLArCjv5Q","image_url": "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yYjlqRzVmTVp3MU11bFFpSjl3S1VrbzJrVVMifQ", "first_name": "Ahmad", "last_name": "Wehbe", "username": "ahmadvbee"}}' https://jsmmm.vercel.app/api/webhook/clerk 


  //typical example for update with curl, we will be using all the fields sent with the creation form
  //curl -X POST -H "Content-Type: application/json" -d '{"type": "user.updated", "data": {"id": "user_2b9jFzv5ZeKXSHpGndMLArCjv5Q", "email_addresses": [{"email_address": "ahmad.vbe@gmail.com"}], "image_url": "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yYjlqRzVmTVp3MU11bFFpSjl3S1VrbzJrVVMifQ", "first_name": "Ahmad", "last_name": "Wehbe", "username": "ahmadvbee"}}' https://jsmmm.vercel.app/api/webhook/clerk 

   //typical example for delete with curl, we will be using all the fields sent with the creation form
  //curl -X POST -H "Content-Type: application/json" -d '{"type": "user.deleted", "data": {"id": "user_2b9jFzv5ZeKXSHpGndMLArCjv5Q", "email_addresses": [{"email_address": "ahmad.vbe@gmail.com"}], "image_url": "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yYjlqRzVmTVp3MU11bFFpSjl3S1VrbzJrVVMifQ", "first_name": "Ahmad", "last_name": "Wehbe", "username": "ahmadvbee"}}' https://jsmmm.vercel.app/api/webhook/clerk 




//   route.ts with svix analyses
// import { Webhook } from 'svix'
// import { headers } from 'next/headers'
// import { WebhookEvent } from '@clerk/nextjs/server'
// import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions'
// import { clerkClient } from '@clerk/nextjs'
// import { NextResponse } from 'next/server'
 


//  // Function to decode JWT token
// function decodeJwt(token: string | undefined): any {
//   try {
//     if (!token) {
//       return null;
//     }

//     const base64Url = token.split(".")[1];
//     const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//     const jsonPayload = decodeURIComponent(atob(base64).split("").map(function(c) {
//       return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
//     }).join(""));
  
//     return JSON.parse(jsonPayload);
//   } catch (error) {
//     console.error("Error decoding JWT:", error);
//     return null;
//   }
// }

// console.log('Top-level of route.ts:', new Date().toISOString());
// export async function POST(req: Request) {
  
//   console.log('Webhook request received:', new Date().toISOString());
//   // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
//   const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
 
//   if (!WEBHOOK_SECRET) {
//     throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
//   }
 
//   // // Get the headers
//   // const headerPayload = req.headers;
//   // const svix_id = headerPayload.get("svix-id") || JSON.parse(headerPayload.get("x-vercel-sc-headers")).svix_id;
//   // const svix_timestamp = headerPayload.get("svix-timestamp") || JSON.parse(headerPayload.get("x-vercel-sc-headers")).svix_timestamp;
//   // const svix_signature = headerPayload.get("svix-signature") || JSON.parse(headerPayload.get("x-vercel-sc-headers")).svix_signature;
  
//   const headerPayload = req.headers;
//   const svix_id = headerPayload.get("x-vercel-id");
//   const svix_timestamp = headerPayload.get("x-vercel-proxy-signature-ts");
//   const signature = headerPayload.get("x-vercel-proxy-signature");
//   let svix_signature, token
//   if (signature) {
//      token = signature.split("Bearer ")[1];
//     if (token) {
//       const svix_signature = decodeJwt(token);
//       // Now you can use the 'decodedToken' variable as needed
//       console.log("Decoded Token:", svix_signature);
//     } else {
//       console.error("Token is null or undefined");
//       // Handle the case where 'token' is null or undefined
//     }
//   } else {
//     console.error("signature is null or undefined");
    
//     // Handle the case where 'svix_signature' is null or undefined
//   }

//   // If there are no headers, error out
//   // if (!svix_id || !svix_timestamp || !svix_signature) {
//   //   return new Response('Error occured -- no svix headers', {
//   //     status: 400
//   //   })
//   // }
// //   const x_vercel_sc_headers = headerPayload.get("x-vercel-sc-headers");

// // let svix_id, svix_timestamp, svix_signature, token;
// // if (x_vercel_sc_headers) {
// //   const parsedHeaders = JSON.parse(x_vercel_sc_headers);
// //   const authorizationHeader = parsedHeaders?.Authorization;
  
// //   if (authorizationHeader) {
    
// //     token = authorizationHeader.split("Bearer ")[1];
// //     //token=parsedHeaders.split("Bearer ")[1];
    
// //     const decodedToken = decodeJwt(token);
// //     console.log(decodedToken)
// //     // Assuming decodedToken has the necessary information
// //     svix_id = decodedToken?.svix_id;
// //     svix_timestamp = decodedToken?.svix_timestamp;
// //     svix_signature = decodedToken?.svix_signature;
// //   }
// // // } else {
// // //   svix_id = headerPayload.get("svix-id");
// // //   svix_timestamp = headerPayload.get("svix-timestamp");
// // //   svix_signature = headerPayload.get("svix-signature");
// // // }


// if (!svix_id || !svix_timestamp || !svix_signature) {
//   let headersString = '';
//   headerPayload.forEach((value, name) => {
//     headersString += `${name}: ${value}\n`;
//   });

//   // Include details from the decoded token in the error response
//   let errorResponse = `Headers: ${headersString} Missing headers: ${!svix_id ? 'svix_id ' : ''}${!svix_timestamp ? 'svix_timestamp ' : ''}${!svix_signature ? 'svix_signature' : ''}`;
//     const decodedTokenDetails = decodeJwt(token);
//     errorResponse += `\nDecoded Token: ${JSON.stringify(decodedTokenDetails)}`;
  
//   return new Response(errorResponse, {
//     status: 400
//   });
// }
// // }
// // If there are no headers, error out
// // if (!svix_id || !svix_timestamp || !svix_signature) {
// //   let headersString = '';
// //   headerPayload.forEach((value, name) => {
// //     headersString += `${name}: ${value}\n`;
// //   });

// //   return new Response(`Headers: ${headersString} Missing headers: ${!svix_id ? 'svix_id ' : ''}${!svix_timestamp ? 'svix_timestamp ' : ''}${!svix_signature ? 'svix_signature' : ''}`, {
// //     status: 400
// //   });
// // }
//   //return new Response('Error occured -- no svix headers', {

//   // Get the body
//   const payload = await req.json()
//   const body = JSON.stringify(payload);
 
//   // Create a new Svix instance with your secret.
//   const wh = new Webhook(WEBHOOK_SECRET);
 
//   let evt: WebhookEvent
 
//   // Verify the payload with the headers
//   // try {
//   //   evt = wh.verify(body, {
//   //     "svix-id": svix_id,
//   //     "svix-timestamp": svix_timestamp,
//   //     "svix-signature": svix_signature,
//   //   }) as WebhookEvent;
//   // } catch (err) {
//   //   console.error('Error verifying webhook:', err);
  
//   //   if (err instanceof Error && err.message.includes('Forbidden prefix')) {
//   //     // Log details about the forbidden prefix issue
//   //     console.error('Forbidden prefix issue. Headers:', req.headers);
//   //   }
  
//   //   return new Response('Error occurred during webhook verification', {
//   //     status: 400
//   //   });
//   // }
 
//   // Get the ID and type
//   const { id } = evt.data;
//   const eventType = evt.type;
 
//   if(eventType === 'user.created') {
//     const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

//     const user = {
//       clerkId: id,
//       email: email_addresses[0].email_address,
//       username: username!,
//       firstName: first_name,
//       lastName: last_name,
//       photo: image_url,
//     }

//     const newUser = await createUser(user);

//     if(newUser) {
//       await clerkClient.users.updateUserMetadata(id, {
//         publicMetadata: {
//           userId: newUser._id
//         }
//       })
//     }

//     return NextResponse.json({ message: 'OK', user: newUser })
//   }
