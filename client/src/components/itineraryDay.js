import React from "react";
import hpr from "../helpers/helper_fn.js";

function ItineraryDay(props) {
  //Arguments
  var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const date = props.date.toLocaleDateString('en-US', options)
  const itin = props.itin

  return (
    <div>
      <h4>{date}</h4>
      { (itin) ?
          <ul className="mtn20 half-pad">
            {itin.map((item) => (
              <li key={[item.arrive, item.leave, item.loc.name].join(",")}>
                { (item.loc.address) ?
                <div>{hpr.timeNumToStr(item.arrive)} - {hpr.timeNumToStr(item.leave)} &emsp; {item.loc.name} - {item.loc.address}</div>
                :
                <div>{hpr.timeNumToStr(item.arrive)} - {hpr.timeNumToStr(item.leave)} &emsp; {item.loc.name}</div>
                }
              </li>
            ))}
          </ul>
          :
          <div className="mtn20">&emsp; Today is a free day. Do whatever you like</div>
      }
    </div>
  );
}

export default ItineraryDay

//Asides - Upload to github, make github public, load website, append this project to website