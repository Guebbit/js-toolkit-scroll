/**
 * Create UUID
 * Random string so complicated and random that collision should be impossible (like addresses on blockchain)
 * WARNING: For compatibility reason it cannot start with a number
 * WARNING: For professional crypto secure use: https://github.com/uuidjs/uuid
 *
 * @param blueprint
 */
export default(blueprint = "gxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx") =>
  blueprint.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  })
