// const BASE_URL = 'https://swift-drop-eta.vercel.app/api';

// export const dropApi = {
//   getDrops: async () => {
//     const res = await fetch(`${BASE_URL}/drops`);
//     return res.json();
//   },

//   getDropById: async (id) => {
//     const res = await fetch(`${BASE_URL}/drops/${id}`);
//     return res.json();
//   },

//   createDrop: async (payload) => {
//     const res = await fetch(`${BASE_URL}/drops`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload)
//     });
//     return res.json();
//   },

//   claimDrop: async (dropId, user) => {
//     const res = await fetch(`${BASE_URL}/drops/${dropId}/claim`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(user)
//     });
//     return res.json();
//   }
// };