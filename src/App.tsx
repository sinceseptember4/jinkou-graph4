import React, { useEffect,useRef, FC, CSSProperties } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Title } from "./components/title";
import { Graph } from "./components/graph"

export const App: FC = (props: HighchartsReact.Props) => {
  const [ApiKey, setApiKey] = React.useState<string | null>("XKTYU01YdTFuFKoRNLlev4Wk6GJAqFgPiv8QaiIM");
  const [HeadersState, setHeadersState] = React.useState<HeadersInit | undefined>(undefined);
  const [SelectNumbers, setSelectNumbers] = React.useState<number[]>([]);
  const [TodoufukenData, setTodoufukenData] = React.useState<TodoufukenData[]>([]);
  const [GraphData, setGraphData] = React.useState<Highcharts.Options>({});

  interface TodoufukenData {
    prefCode: string;
    prefName: number;
  }
  interface ValuesData {
    year: string;
    value: number;
  }

  //const ApiKey = "XKTYU01YdTFuFKoRNLlev4Wk6GJAqFgPiv8QaiIM";
  // 各都道府県の名前とidを取得
  useEffect(() => {
    let apiKeyPrompt = HeadersState;
    if (apiKeyPrompt === undefined) {
      const prompt = window.prompt("apiKeyを入力してください", "");
      const headers = new Headers({
        "X-API-KEY": ` ${prompt}`
      });
      apiKeyPrompt = headers && new Headers(headers);
    }
    setHeadersState(apiKeyPrompt)
    fetch(`https://opendata.resas-portal.go.jp/api/v1/prefectures`, {
      headers: apiKeyPrompt
    })
      .then((response) => response.json())
      .then((data) => setTodoufukenData(data.result))
      .catch((error) =>
        alert(
          "エラーが発生しました。APIKEYが間違っている可能性があります。" + error
        )
      );

    fetch(
      `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?prefCode=0`,
      { headers: apiKeyPrompt }
    )
      .then((response) => response.json())
      .then((data) => {
        const dates :ValuesData[] = data.result.data[0]["data"];
        console.log(dates)
        let arr: string[] = [];
        dates.forEach((e) => {
          arr = [...arr, e["year"]];
        });
        setGraphData({
          title: {
            text: "",
          },
          xAxis: {
            categories: arr,
          },
          yAxis: {
            title: {
              text: "人口",
            },
          },
          series: [],
        });
      })
      .catch((error) =>
        alert(
          "エラーが発生しました。APIKEYが間違っている可能性があります。" + error
        )
      );
  }, []);

  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);


  const getData = (prefCode: number, ApiKey: string | null) => {
    setSelectNumbers([...SelectNumbers, prefCode]);

    if (ApiKey !== null) {
      fetch(
        `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?prefCode=${prefCode}`,
        { headers: { "X-API-KEY": ApiKey } }
      )
        .then((response) => response.json())
        .then((data) => {
          const dates :ValuesData[]= data.result.data[0]["data"];
          let arr: number[] = [];
          dates.forEach((e) => {
            arr = [...arr, e["value"]];
          });
          if (GraphData.series !== undefined) {
          let series: Highcharts.SeriesOptionsType[] = GraphData.series;
          const name = String(TodoufukenData[prefCode - 1]["prefName"]);
          const frame: Highcharts.SeriesOptionsType = {
            type: "line",
            name: name,
            data: arr,
          };
          series = [...series, frame];
          const graphDataBefore: Highcharts.Options = { series: series };
          setGraphData(graphDataBefore);
          }
        })
        .catch((error) =>
          alert(
            "エラーが発生しました。APIKEYが間違っている可能性があります。" +
              error
          )
        );
    } else {
      console.error("apikey が設定されていません");
    }
  };

  const deleteData = (prefCode: number) => {
    const search = SelectNumbers.indexOf(prefCode);
    let series = GraphData.series;
    if (series !== undefined) {
      series.splice(search, 1);
      const graphDataBefore: Highcharts.Options = { series: series };
      setGraphData(graphDataBefore);
    }
  };
  const judge = (prefCode: string, ApiKey: string | null) => {
    let e = document.getElementById(prefCode) as HTMLInputElement;
    let num = Number(prefCode);
    if (e === null) {
      console.error("都道府県のID取得に失敗しました");
    } else if (e.checked) {
      getData(num, ApiKey);
    } else {
      deleteData(num);
    }
  };
  let dataOptions: Highcharts.DataOptions = {}
  useEffect(() => {  
  const options: Highcharts.Options = GraphData;
  dataOptions = options as Highcharts.DataOptions;
  console.log(dataOptions)
  }, [GraphData]);

  const p: CSSProperties = {
    display: "inline-block",
    width: "100px",
    height: "30px",
    margin: "0",
  };
  const input: CSSProperties = {
    cursor: "pointer",
  };
  const sell: CSSProperties = {
    display: "inline-block",
    width: "120px",
    height: "30px",
    margin: "0",
  };
  return (
    <>
      <Title />
      {TodoufukenData.length === 0 && <h1>エラーが発生しました</h1>}
      {
      TodoufukenData.map((data, index) => {
        /**
         * @type {string} 都道府県の名前
         */
        const prefName = data["prefName"];
        /**
         * @type {number} 都道府県の呼出番号
         */
        const prefCode = data["prefCode"];
        /**
         * @type {string} 都道府県の呼出番号のString型
         */
        const prefCodeID: string = String(prefCode);
        return (
          <div key={index} style={sell} className="list-row">
            <input
              style={input}
              type="checkbox"
              name="select"
              onClick={() => judge(prefCodeID, ApiKey)}
              id={prefCodeID}
            />
            <p style={p}>{prefName}</p>
          </div>
        );
      })
      }
    
      <HighchartsReact
        highcharts={Highcharts}
        options={GraphData}
        ref={chartComponentRef}
        {...props}
      />
      <Graph data={dataOptions}></Graph>
    </>
  );
};