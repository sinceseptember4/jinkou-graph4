import React, { useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import accessibility from 'highcharts/modules/accessibility';


export const Graph = (props :{data:Highcharts.Options}) => {
  accessibility(Highcharts);
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  return <>
      <HighchartsReact
        highcharts={Highcharts}
        options={props.data}
        ref={chartComponentRef}
      />
  </>
  
}
