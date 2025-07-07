import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 100,          // 100 virtual users
  duration: '30s',   // run for 30 seconds
};

export default function () {
  const res = http.get('http://localhost:3000/patients/12345', {
    headers: { Authorization: `Bearer ${__ENV.TOKEN}` }
  });
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
