import React, { useRef,  } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";




export const Graph = (props :{data:Highcharts.Options}) => {
  
const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
console.log(props);
  return <>
      <HighchartsReact
        highcharts={Highcharts}
        options={props.data}
        ref={chartComponentRef}
      />
  </>
  

}
