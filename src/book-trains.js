import { BOOK_EXPRESS_TRAINS } from './book-express.js';
import { BOOK_TOURIST_A_TRAINS } from './book-tourist-a.js';
import { BOOK_TOURIST_B_TRAINS } from './book-tourist-b.js';
import { BOOK_LOCAL_WORK_TRAINS } from './book-local-work.js';

// Original illustrations of trains named in the publisher's public contents.
export const BOOK_TRAINS = [
  ...BOOK_EXPRESS_TRAINS,
  ...BOOK_TOURIST_A_TRAINS,
  ...BOOK_TOURIST_B_TRAINS,
  ...BOOK_LOCAL_WORK_TRAINS,
];
