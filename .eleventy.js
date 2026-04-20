module.exports = function(eleventyConfig) {
  // Helper: convert any date to an ISO string with Eastern Time offset
  function toEasternISO(date) {
    const d = new Date(date);
    const eastern = new Date(d.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const utc = new Date(d.toLocaleString('en-US', { timeZone: 'UTC' }));
    const offsetMinutes = (utc - eastern) / 60000;
    const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
    const offsetMins = Math.abs(offsetMinutes) % 60;
    const offsetSign = offsetMinutes >= 0 ? '-' : '+';
    const offset = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')}`;
    const year = eastern.getFullYear();
    const month = String(eastern.getMonth() + 1).padStart(2, '0');
    const day = String(eastern.getDate()).padStart(2, '0');
    const hours = String(eastern.getHours()).padStart(2, '0');
    const minutes = String(eastern.getMinutes()).padStart(2, '0');
    const seconds = String(eastern.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offset}`;
  }

  // Copy static assets to output
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/photos");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/*.{png,svg,ttf,webp}");
  
  // Add date filter for Nunjucks
  eleventyConfig.addFilter("date", function(date, format) {
    const d = new Date(date);
    const months = ["January", "February", "March", "April", "May", "June", 
                    "July", "August", "September", "October", "November", "December"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  });
  
  // Add limit filter for Nunjucks
  eleventyConfig.addFilter("limit", function(array, limit) {
    return array.slice(0, limit);
  });

  // Format date for show display in Eastern Time: "Saturday, April 25 • 8:00 PM"
  eleventyConfig.addFilter("showDate", function(date) {
    const d = new Date(date);
    const eastern = new Date(d.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    let hours = eastern.getHours();
    const minutes = eastern.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${days[eastern.getDay()]}, ${months[eastern.getMonth()]} ${eastern.getDate()} \u2022 ${hours}:${minutes} ${ampm}`;
  });

  // Format date only (no time, no day name) in Eastern Time: "April 25"
  eleventyConfig.addFilter("showDateOnly", function(date) {
    const d = new Date(date);
    const eastern = new Date(d.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    return `${months[eastern.getMonth()]} ${eastern.getDate()}`;
  });

  // Day of week only in Eastern Time: "Saturday"
  eleventyConfig.addFilter("showDayOfWeek", function(date) {
    const d = new Date(date);
    const eastern = new Date(d.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[eastern.getDay()];
  });

  // Format time only in Eastern Time: "8:00 PM"
  eleventyConfig.addFilter("showTimeOnly", function(date) {
    const d = new Date(date);
    const eastern = new Date(d.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    let hours = eastern.getHours();
    const minutes = eastern.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  });

  // ISO date filter for schema (Eastern Time offset)
  eleventyConfig.addFilter("isoDate", function(date) {
    return toEasternISO(date);
  });

  // Check if all showtimes are sold out
  eleventyConfig.addFilter("allSoldOut", function(showtimes) {
    if (!showtimes || !showtimes.length) return false;
    return showtimes.every(function(st) {
      return st.ticketAvailability === 'https://schema.org/SoldOut';
    });
  });

  // Generate event schema JSON-LD for a collection of shows (one Event per showtime)
  eleventyConfig.addFilter("eventSchema", function(shows) {
    if (!shows || !shows.length) return '[]';
    var events = [];
    shows.forEach(function(show) {
      var d = show.data;
      if (!d.showtimes || !d.showtimes.length) return;

      d.showtimes.forEach(function(st) {
        var event = {
          "@context": "https://schema.org",
          "@type": "Event",
          "name": d.title + (d.subtitle ? ' ' + d.subtitle : ''),
          "startDate": toEasternISO(st.startDate),
          "endDate": toEasternISO(st.endDate),
          "eventStatus": d.eventStatus,
          "eventAttendanceMode": d.eventAttendanceMode,
          "location": {
            "@type": "Place",
            "name": d.location.name,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": d.location.streetAddress,
              "addressLocality": d.location.city,
              "addressRegion": d.location.state,
              "postalCode": d.location.postalCode,
              "addressCountry": d.location.country
            }
          },
          "description": d.description,
          "organizer": {
            "@type": "Organization",
            "name": d.organizerName || "Misconduct Comedy",
            "url": d.organizerUrl || "https://misconductcomedy.com"
          }
        };

        if (d.images && d.images.length) {
          event.image = d.images.map(function(img) {
            return "https://misconductcomedy.com" + img.src;
          });
        }

        if (st.ticketUrl || st.ticketPrice) {
          event.offers = {
            "@type": "Offer",
            "url": st.ticketUrl || "https://misconductcomedy.com",
            "availability": st.ticketAvailability || "https://schema.org/InStock"
          };
          if (st.ticketPrice) {
            event.offers.price = st.ticketPrice.toString();
            event.offers.priceCurrency = d.priceCurrency || "USD";
          }
          if (d.ticketSaleStart) {
            event.offers.validFrom = toEasternISO(d.ticketSaleStart);
          }
        }

        if (d.performers && d.performers.length) {
          event.performer = d.performers.map(function(p) {
            return { "@type": "Person", "name": p.name };
          });
        }

        events.push(event);
      });
    });
    return JSON.stringify(events, null, 2);
  });

  // Custom collection: shows sorted by first showtime's start date
  eleventyConfig.addCollection("showsByDate", function(collectionApi) {
    return collectionApi.getFilteredByTag("shows").sort(function(a, b) {
      var aDate = a.data.showtimes && a.data.showtimes.length ? new Date(a.data.showtimes[0].startDate) : new Date(0);
      var bDate = b.data.showtimes && b.data.showtimes.length ? new Date(b.data.showtimes[0].startDate) : new Date(0);
      return aDate - bDate;
    });
  });
  
  // Set custom directories for input, output, includes, and data
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};
