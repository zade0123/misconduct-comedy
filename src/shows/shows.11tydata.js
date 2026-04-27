module.exports = {
  tags: "shows",
  eleventyComputed: {
    pageTitle: data => `${data.title}${data.subtitle ? ' ' + data.subtitle : ''} | Live Stand-Up Comedy in Philadelphia`,
    metaDescription: data => data.metaDescription || data.description,
    permalink: data => {
      if (!data.showtimes || !data.showtimes.length) return false;
      const d = new Date(data.showtimes[0].startDate);
      const eastern = new Date(d.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const months = ['january','february','march','april','may','june',
                      'july','august','september','october','november','december'];
      const month = months[eastern.getMonth()];
      const day = eastern.getDate();
      const year = eastern.getFullYear();
      return `/shows/${month}-${day}-${year}/`;
    }
  }
};
