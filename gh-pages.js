var ghpages = require('gh-pages');

ghpages.publish(
    'public',
    {
        branch: 'gh-pages',
        repo: 'https://github.com/JordiGL/COIN-STATS',
        user: {
            name: 'Jordi Gómez Lozano', 
            email: 'jordi.g.l@live.com' 
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)