/**
 * Shared shape documentation.
 *
 * The app is plain JavaScript, but these JSDoc typedefs give editors real
 * autocompletion on the objects that cross module boundaries, and they double
 * as the written contract for what a "course" or "review" actually contains.
 *
 * @typedef {Object} Lesson
 * @property {string} id
 * @property {"video"|"pdf"} type
 * @property {string} title
 * @property {string} url
 *
 * @typedef {Object} Course
 * @property {string} _id
 * @property {string} subject
 * @property {string} category
 * @property {string} instructor
 * @property {string|null} instructorEmail
 * @property {string} img
 * @property {string} description
 * @property {string} class
 * @property {string} days
 * @property {string} level
 * @property {number} cost
 * @property {number} [originalCost]
 * @property {boolean} bestseller
 * @property {number} [rating]
 * @property {number} [students]
 * @property {string} createdAt ISO string
 *
 * @typedef {Object} Review
 * @property {string} _id
 * @property {string} email
 * @property {string} name
 * @property {string|null} [photoURL]
 * @property {string} userReview
 * @property {number} [rating]
 * @property {string} serviceId
 * @property {string} subject
 * @property {string} createdAt ISO string
 *
 * @typedef {Object} SessionUser
 * @property {string} uid
 * @property {string} email
 * @property {string} name
 * @property {string|null} picture
 */

export {};
