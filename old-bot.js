// authenticates you with the API standard library
// type `await lib.` to display API autocomplete
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
const { registerFont, createCanvas, loadImage } = require('canvas');
const { random } = require('lodash');
const { randomColor } = require('randomcolor');
const fetch = require('cross-fetch');

const comicsans = require('@canvas-fonts/comic-sans-ms');
registerFont(comicsans, {family: 'Comic Sans'});

const MAX_LENGTH = 280;

function getHardCodedQuote(n) {
  const tweets_data = [
    "People will throw stones at you. Don't throw them back. Collect them all and build an empire",
    "Nothing is impossible, the word itself says I'm possible ",
    "I may not be there yet, but I am closer than I was yesterday ",
    "I may not be the best... but I sure am trying my best ",
    "There’s about to be a shift in your life. Get ready for your blessings. You’ve been through enough and a breakthrough is on the way ",
    "Fight for your dreams and your dreams will fight for you ",
    "Don't quit. Suffer now and live the rest of your life as a champion ",
    "no matter your current circumstances if you can imagine something better for yourself you can create it ",
    "Being upset will not solve any problem, but getting UP and SET your way to your goals will ",
    "Being negative only causes depression. So hold your head up high, put a smile on your face & go live a positive life ",
    "Things turn out best for the people who make the best of the way things turn out ",
    "Life is not about winning, it's about not giving up ",
    "Every king was once a crying baby. Every great building was once a blueprint. It’s not where you are today but where ",
    "Do not live your life full of WHAT IF's. rather, live your life full of WHY NOT's ",
    "Perseverance is not a long race; it is many short races one after another ",
    "A pessimist sees the difficulty in every opportunity; an optimist sees the opportunity in every difficulty ",
    "Some people want it to happen, some wish it would happen, others make it happen ",
    "When you truly believe in what you are doing, it shows. And it pays. Winners in life are those who are excited about where they are going",
    "Not everything that is faced can be changed, but nothing can be changed until it is faced",
    "It does not matter how many times you get knocked down, but how many times you get up",
    "When there’s something you really want, fight for it. Don’t give up no matter how hopeless it seems",
    "The sun is a daily reminder that we too can rise again from the darkness, that we too can shine our own light",
    "The difference between who you are and who you want to be is what you do",
    "Success is finding satisfaction in giving a little more than you take ",
    "What defines us is how well we rise after we fall, ",
    "Success is where preparation and opportunity meet ",
    "Every champion was once a contender that didn’t give up ",
    "Live your vision and demand your success ",
    "Success is the child of drudgery and perseverance. It cannot be coaxed or bribed; pay the price and it is yours ",
    "To succeed you have to believe in something with such passion that it becomes a reality ",
    "Dream big, it’s the first step to success ",
    "Success is sweet and sweeter if long delayed and gotten through many struggles and defeats ",
    "You deserve to be successful and happy, smile :) ",
    "Our greatest glory is not in never falling, but in rising every time we fall ",
    "The five essential entrepreneurial skills for success: Concentration, Discrimination, Organization, Innovation and Communication ",
    "The key to success is to focus our conscious mind on things we desire not things we fear ",
    "Success comes from knowing that you did your best to become the best that you are capable of becoming ",
    "The harder you work for something, the greater you’ll feel when you achieve it ",
    "The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack of will ",
    "Man needs his difficulties because they are necessary to enjoy success ",
    "The secret of success is to do the common thing uncommonly well ",
    "Success is how high you bounce when you hit bottom ",
    "Success isn't measured by money or power or social rank. Success is measured by your discipline and inner peace ",
    "Success is not final, failure is not fatal: it is the courage to continue that counts"
  ];

  return tweets_data[n % tweets_data.length];
}

function generateRandomColor() {
  return randomColor({
    luminosity: 'dark',
  });
}

// Function to fetch an image from Unsplash API
async function fetchBackgroundImage() {
  const apiKey = '';
  const apiUrl = 'https://api.unsplash.com/photos/random';
  const query = 'mountains lake nature'; // Adjust the query to match your desired image theme

  const url = `${apiUrl}?query=${query}&orientation=landscape`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${apiKey}`
      }
    });
    const data = await response.json();
    if (response.ok) {
      return [data.urls.regular, data.user.name]; // Return the URL of the regular-sized image
    } else {
      console.error('Failed to fetch image from Unsplash:', data.errors);
      return [null, null];
    }
  } catch (error) {
    console.error('Error occurred while fetching image from Unsplash:', error);
    return [null, null];
  }
}

async function getQuoteData() {
  let res = await lib.http.request['@1.1.7'].get({
    url: `https://api.quotable.io/random`,
    queryParams: {
      'tags': `inspirational|success|motivational|leadership`,
      'maxLength': 210
    }
  });

  return res;
}

async function setupTweet(current_tweet, n, backgroundImageUrl, photographer) {
  let tweet_body = `
    Quote #${n + 1}: ${current_tweet}

Photo by ${photographer} on Unsplash
#MotivationalQuotes
    `;

    // Setting up canvas
    let width = 1200, height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // drawing background image
    if (backgroundImageUrl) {
      const backgroundImage = await loadImage(backgroundImageUrl);
      ctx.drawImage(backgroundImage, 0, 0, width, height);
    }
    else {
      const backgroundColor = generateRandomColor();
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Get the image data from the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // Convert the image data to an array of Color objects
    let rgb = {r:0,g:0,b:0}, count = 0;
    for (let i = 0; i < imageData.length; i += 4) {
      rgb.r = imageData[i];
      rgb.g = imageData[i + 1];
      rgb.b = imageData[i + 2];
      count++;
    }

    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);

    const brightness = (0.2126 * rgb.r) + (0.7152 * rgb.g) + (0.0722 * rgb.b);

    if (brightness < 128) // image is dark
      ctx.fillStyle = '#D5CEA3';
    else
      ctx.fillStyle = '#3C2A21';

    // Add a tweet text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'; // Shadow color
    ctx.shadowBlur = 7; // Shadow blur level
    ctx.shadowOffsetX = 0; // Horizontal shadow offset
    ctx.shadowOffsetY = 0; // Vertical shadow offset
    ctx.strokeStyle = 'black'; // Outline color
    ctx.lineWidth = 2; // Outline thickness

    const words = current_tweet.split(' ');
    let fontsize = 80;
    let lines = 1;

    // lower the font size until the text fits the canvas
    do {
      if (fontsize < 48 && lines <= 3) {
        current_tweet = "";
        for (let i =0; i < lines; i++) {
          current_tweet += words.slice(i * words.length/lines, (i+1) * words.length/lines).join(' ')
                        + "\n";
        }
        lines++;
        fontsize += 14;
      }
      fontsize--;
      ctx.font = `bold ${fontsize}px "Comic Sans"`;
    } while (ctx.measureText(current_tweet).width > canvas.width * 0.9)

    let text_lines = current_tweet.split("\n");
    let mll = 0; // max line length
    for (let i = 0; i < text_lines.length; i++)
      if (text_lines[i].length > mll) mll = text_lines[i].length;

    for (let i = 0; i < text_lines.length; i++)
    {
      let padding  = (mll - text_lines[i].length) / 2;
      text_lines[i] = ' '.repeat(padding) + text_lines[i] + ' '.repeat(padding);
    }

    current_tweet = text_lines.join("\n");

    ctx.strokeText(current_tweet, width/2, height/2 - (ctx.measureText(current_tweet).actualBoundingBoxAscent + ctx.measureText(current_tweet).actualBoundingBoxDescent)/2);
    ctx.fillText(current_tweet, width/2, height/2 - (ctx.measureText(current_tweet).actualBoundingBoxAscent + ctx.measureText(current_tweet).actualBoundingBoxDescent)/2);

    return [tweet_body, canvas];
}

async function postTweet(body, image) {
  console.log(`Tweeting:\n${body}\n`);

  const uploadResult = await lib.twitter.media['@2.0.0'].upload({
    media: image.toBuffer(),
  });

  console.log(`Upload Response:\n${uploadResult['media_id']}`);

  await lib.twitter.tweets['@1.1.2'].statuses.create({
    status: body, // required
    media_ids: `${uploadResult['media_id']}`,
  });
}

async function main() {
  let n = await lib.twitter.tweets['@1.1.2'].statuses.userTimeline.list({
    screen_name: `Motivator_McBot`,
  }).then((n) => n[0].text.split(':')[0].match(/\d/g).join(''));
  n = parseInt(n);

  let quote = "";

  console.log(`Fetching Quote`);
  let result = await getQuoteData();
  if (result.statusCode == 200) {
    console.log(`Quote Fetched Successfully`);
    quote = result.data.content;
  } else {
    console.warn(`Couldn't Fetch Quote`);
    quote = getHardCodedQuote(n);
  }

  console.log(`Fetching Background Image`);
  let [backgroundImageUrl, photographer] = await fetchBackgroundImage();
  if (!backgroundImageUrl)
  {
    console.warn(`Couldn't Fetch Background Image`);
    backgroundImageUrl = null;
  }

  let [tweetBody, tweetImage] = await setupTweet(quote, n, backgroundImageUrl, photographer);

  await postTweet(tweetBody, tweetImage);

  return `Tweeting:\n${tweetBody}`;
}

return await main().catch(console.error);
