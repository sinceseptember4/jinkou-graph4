import React, { useRef, FC, CSSProperties } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";




export const Graph = (props :Highcharts.Options | undefined) => {

console.log(props)
const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  return <>
      <HighchartsReact
        highcharts={Highcharts}
        options={props}
        ref={chartComponentRef}
        {...props}
      />
  </>
  

}
