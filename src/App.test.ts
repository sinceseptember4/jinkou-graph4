import axios from 'axios';
import { ApiUrlPrefectures } from './Url';

const fetchPrefectureStatusCode = (ApiUrlPrefectures: string): Promise<string> => {
  return axios
    .get(ApiUrlPrefectures)
    .then((response) => {
      const statusCode: string = response.data['statusCode'];
      return statusCode;
    })
    .catch((error) => {
      return error;
    });
};


test('API data test', () => {
  return fetchPrefectureStatusCode(ApiUrlPrefectures).then((data) => {
    expect(data).toBe('403');
  });
});