import React, { useEffect, useRef, FC, CSSProperties } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Title } from './components/title';
import { Graph } from './components/graph';

export const App: FC = (props: HighchartsReact.Props) => {
  const [HeadersState, setHeadersState] = React.useState<HeadersInit | undefined>(undefined);
  const [SelectNumbers, setSelectNumbers] = React.useState<number[]>([]);
  const [TodoufukenData, setTodoufukenData] = React.useState<TodoufukenData[]>([]);
  const [GraphData, setGraphData] = React.useState<Highcharts.Options>({});
  const ApiUrl = 'https://opendata.resas-portal.go.jp';
  interface TodoufukenData {
    prefCode: string;
    prefName: number;
  }

  interface ValuesData {
    year: string;
    value: number;
  }

  // 各都道府県の名前とidを取得
  useEffect(() => {
    /**
     * @type {HeadersInit | undefined} HeadersState と同じデータ。stateの使用上、useEffect内ではこれを使用
     */
    let apiKeyPrompt = HeadersState;
    if (apiKeyPrompt === undefined) {
      const prompt = window.prompt('apiKeyを入力してください', '');
      /**
       * @type {HeadersInit} {"X-API-KEY": API keyが挿入});
       */
      const headers = new Headers({
        'X-API-KEY': ` ${prompt}`,
      });
      apiKeyPrompt = headers && new Headers(headers);
    }
    setHeadersState(apiKeyPrompt);
    fetch(`${ApiUrl}/api/v1/prefectures`, {
      headers: apiKeyPrompt,
    })
      .then((response) => response.json())
      .then((data) => setTodoufukenData(data.result))
      .catch((error) =>
        alert('エラーが発生しました。APIKEYが間違っている可能性があります。' + error)
      );

    fetch(`${ApiUrl}/api/v1/population/composition/perYear?prefCode=0`, {
      headers: apiKeyPrompt,
    })
      .then((response) => response.json())
      .then((data) => {
        /**
         * @type {{ year: string, value: number }} year: 西暦。グラフに挿入する都合上、文字列　value: その年の人口数
         */
        const dates: ValuesData[] = data.result.data[0]['data'];
        let arr: string[] = [];
        dates.forEach((e) => {
          arr = [...arr, e['year']];
        });
        //ここで初期データを挿入
        setGraphData({
          title: {
            text: '',
          },
          xAxis: {
            categories: arr,
          },
          yAxis: {
            title: {
              text: '人口',
            },
          },
          series: [],
        });
      })
      .catch((error) =>
        alert('エラーが発生しました。APIKEYが間違っている可能性があります。' + error)
      );
  }, []);

  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  /**
   * 選択されたデータの取得
   * @param {string}  prefCode  各都道府県の呼び出し番号
   * @param {HeadersInit | undefined} HeadersState HeadersStateを挿入　{"X-API-KEY": API keyが挿入}
   */
  const getData = (prefCode: number, HeadersState: HeadersInit | undefined) => {
    setSelectNumbers([...SelectNumbers, prefCode]);

    if (HeadersState !== undefined) {
      fetch(`${ApiUrl}/api/v1/population/composition/perYear?prefCode=${prefCode}`, {
        headers: HeadersState,
      })
        .then((response) => response.json())
        .then((data) => {
          /**
           * @type {{ year: string, value: number }} year: 西暦。グラフに挿入する都合上、文字列　value: その年の人口数
           */
          const dates: ValuesData[] = data.result.data[0]['data'];
          /**
           *  @type {number[]}　valueの年数順
           */
          let arr: number[] = [];
          dates.forEach((e) => {
            arr = [...arr, e['value']];
          });
          if (GraphData.series !== undefined) {
            /**
             * @type {Highcharts.SeriesOptionsType[]} GraphDataのseriesから抜粋。データを入れる前の元データ
             */
            let series: Highcharts.SeriesOptionsType[] = GraphData.series;
            /**
             * @type {string} 選択した都道府県の名前
             */
            const name = String(TodoufukenData[prefCode - 1]['prefName']);
            /**
             * @type {Highcharts.SeriesOptionsType[]} 一つの都道府県データ分の枠
             */
            const frame: Highcharts.SeriesOptionsType = {
              type: 'line',
              name: name,
              data: arr,
            };
            series = [...series, frame];
            /**
             * @type {string} setGraphDataに挿入する型作り
             */
            const graphDataBefore: Highcharts.Options = { series: series };
            setGraphData(graphDataBefore);
          }
        })
        .catch((error) =>
          alert('エラーが発生しました。APIKEYが間違っている可能性があります。' + error)
        );
    } else {
      console.error('apikey が設定されていません');
    }
  };
  /**
   * 選択されたデータの削除
   * @param {string}  prefCode  各都道府県の呼び出し番号
   */
  const deleteData = (prefCode: number) => {
    const search = SelectNumbers.indexOf(prefCode);
    let series = GraphData.series;
    if (series !== undefined) {
      series.splice(search, 1);
      const graphDataBefore: Highcharts.Options = { series: series };
      setGraphData(graphDataBefore);
    }
  };
  /**
   * 押されたinputキーが押されているかどうか判断
   * @param {string}  prefCode  各都道府県の呼び出し番号
   * @param {HeadersInit | undefined} HeadersState HeadersStateを挿入　{"X-API-KEY": API keyが挿入}
   */
  const judge = (prefCode: string, HeadersState: HeadersInit | undefined) => {
    let e = document.getElementById(prefCode) as HTMLInputElement;
    let num = Number(prefCode);
    if (e === null) {
      console.error('都道府県のID取得に失敗しました');
    } else if (e.checked) {
      getData(num, HeadersState);
    } else {
      deleteData(num);
    }
  };
  let dataOptions: Highcharts.DataOptions = {};
  useEffect(() => {
    const options: Highcharts.Options = GraphData;
    dataOptions = options as Highcharts.DataOptions;
  }, [GraphData]);

  const p: CSSProperties = {
    display: 'inline-block',
    width: '100px',
    height: '30px',
    margin: '0',
  };
  const input: CSSProperties = {
    cursor: 'pointer',
  };
  const sell: CSSProperties = {
    display: 'inline-block',
    width: '120px',
    height: '30px',
    margin: '0',
  };
  return (
    <>
      <Title />
      {TodoufukenData ? (
        TodoufukenData.map((data, index) => {
          /**
           * @type {string} 都道府県の名前
           */
          const prefName = data['prefName'];
          /**
           * @type {number} 都道府県の呼出番号
           */
          const prefCode = data['prefCode'];
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
                onClick={() => judge(prefCodeID, HeadersState)}
                id={prefCodeID}
              />
              <p style={p}>{prefName}</p>
            </div>
          );
        })
      ) : (
        <p>No data available</p>
      )}

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
