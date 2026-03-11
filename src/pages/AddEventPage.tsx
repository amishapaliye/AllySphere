import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AddEventPage() {
  const [title,setTitle]=useState("");
  const [description,setDescription]=useState("");
  const [date,setDate]=useState("");
  const [location,setLocation]=useState("");
  const [type,setType]=useState("");

  const createEvent = async (e:any)=>{
    e.preventDefault();

    await supabase.from("events").insert([
      {
        title,
        description,
        event_date:date,
        location,
        event_type:type,
        is_published:true
      }
    ]);

    alert("Event Created!");
  };

  return (
    <div style={{padding:"40px"}}>
      <h2>Create Event</h2>

      <form onSubmit={createEvent}>
        <input placeholder="Title" onChange={(e)=>setTitle(e.target.value)} />
        <input placeholder="Description" onChange={(e)=>setDescription(e.target.value)} />
        <input type="datetime-local" onChange={(e)=>setDate(e.target.value)} />
        <input placeholder="Location" onChange={(e)=>setLocation(e.target.value)} />
        <input placeholder="Event Type" onChange={(e)=>setType(e.target.value)} />

        <button type="submit">Publish Event</button>
      </form>
    </div>
  );
}