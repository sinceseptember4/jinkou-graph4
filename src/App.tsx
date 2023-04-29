import React, { FC, useState, useEffect, CSSProperties } from 'react';
import { Title } from './components/title';
import { Graph } from './components/graph';
import { ApiUrl, ApiUrlPrefectures } from './Url';

export const App: FC = () => {
  const [HeadersState, setHeadersState] = useState<HeadersInit | undefined>(undefined);
  const [SelectNumbers, setSelectNumbers] = useState<number[]>([]);
  const [TodoufukenData, setTodoufukenData] = useState<TodoufukenData[]>([]);
  const [GraphData, setGraphData] = useState<Highcharts.Options>({});
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

      if (prompt) {
        prompt.trim();
        const headers = new Headers({
          'X-API-KEY': ` ${prompt}`,
        });
        apiKeyPrompt = headers && new Headers(headers);
      }
    }
    setHeadersState(apiKeyPrompt);
    fetch(ApiUrlPrefectures, {
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
  }, []);

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

      const NewSelectNumbers = SelectNumbers.splice(search, 1);
      setSelectNumbers(NewSelectNumbers);
    }
  };
  /**
   * 押されたinputキーが押されているかどうか判断
   * @param {string}  prefCode  各都道府県の呼び出し番号
   * @param {HeadersInit | undefined} HeadersState HeadersStateを挿入　{"X-API-KEY": API keyが挿入}
   */
  const judge = (prefCode: string, HeadersState: HeadersInit | undefined) => {
    let element = document.getElementById(prefCode) as HTMLInputElement;
    let num = Number(prefCode);
    if (element === null) {
      console.error('都道府県のID取得に失敗しました');
    } else if (element.checked) {
      getData(num, HeadersState);
    } else {
      deleteData(num);
    }
  };

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
           * @type {string} 都道府県の呼出番号のString型
           */
          const prefCodeID = String(data['prefCode']);
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
        <p>APIkeyを挿入してください</p>
      )}

      <Graph data={GraphData}></Graph>
    </>
  );
};
