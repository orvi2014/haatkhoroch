const slug = require('slug');

const createSlug = (name) => {

    const config = {
        replacement: '-',
        symbols: true,
        remove: /[.]/g,
        lower: false,
        charmap: slug.charmap,
        multicharmap: slug.multicharmap,
      }
    return slug(name,config);
}

module.exports = { createSlug };