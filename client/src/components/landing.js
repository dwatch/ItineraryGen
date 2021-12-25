import React from "react";

function Landing() {
  return (
    <div className="landing">
      <h1>Hi there, welcome to ItineraryGen!</h1>
      <h3 className='blue mtn20'>Create lists of places that you want to visit</h3>
      <h3 className='blue mtn20'>Give us more details about your trip</h3>
      <h3 className='blue mtn20'>Let us generate your trip's itinerary!</h3>
      <h3>Here are some limitations:</h3>
      <div className="centered-items blue">
        <ul className="mtn10">
          <li>1. Works best with specific places, like a restaurant or landmark</li>
          <li>2. Works best with places that can be visited in a single day</li>
        </ul>
        <a href="./signin" className="btn btn-primary btn-large w250 ms5"> Click Here to Sign In </a>
        <a href="./signup" className="btn btn-primary btn-large w250 ms5"> Click Here to Sign Up </a>
      </div>
    </div>
  )
}

export default Landing