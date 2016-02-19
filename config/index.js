module.exports = {
    
    port: 8888,
    host: '172.0.0.1',

    feedUrl: 'http://www.boredpanda.com/sitemap.xml',
    cron: {
        time: '0 0 */12 * * *',
        timezone: 'UTC',
        daysToAdd: 3
    },
    urlException: [
    	'http://www.boredpanda.com/',
    	'http://www.boredpanda.com/?show=trending'
    ],
    pointerFileName: '/data/boredpanda/pointer.txt',

    category: ["Travel", "Photography", "Animals", "Illustration", "DIY", "Good News", "Funny", "Art", "Parenting", "Other", "Nature", "Architecture",
        "Product Design", "Style", "Body Art", "Digital Art", "Painting", "Food Art", "Social Issues", "Drawing", "Sculpting", "Entertainment",
        "Advertising", "Interior Design", "Street Art", "Video", "Graphic Design", "Weird", "Optical Illusions", "History", "Paper Art", "Automotive", "Technology",
        "Needle and Thread", "Comics", "Packaging", "Science", "Recycling", "Typography", "Installation", "Land Art", "Furniture Design", "Pics", "Home", "Challenge"].sort()

};