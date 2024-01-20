
import EventForm from "@/components/shared/EventForm";
import { auth } from "@clerk/nextjs";

const CreateEvent = () => {
  //we re gonna pass it 2 diff things: id of the user interacting
        //=>const { sessionClaims } = auth(); hook call imported from next js
        //clerk makes it so easy
  const { sessionClaims } = auth();
        //extracting user id
  const userId = sessionClaims?.userId as string; //in case sessionClaims doesnt exist
  //i forget to add the userId to the metadata of our clerk acc
  //=>customizing our session token in order to retrieve data at any point=>clerk dashboard

  //here we re having adjacent elements, we hve to render them in empty react fragment  
  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">Create Event</h3>
      </section>

      <div className="wrapper my-8">
        <EventForm userId={userId} type="Create"  
        />
      </div>
    </>
  )
}

export default CreateEvent