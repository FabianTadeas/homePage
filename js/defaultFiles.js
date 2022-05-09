export const defaultLinks = [
    {
      name: 'Settings',
      icon: 'adjustments-horizontal',
      type: 'link',
      ID: 'settings',
      order: 0
    },
    {
      name: 'titleA',
      type: 'title',
      ID: 'ta',
      order: 1
    },
    {
      name: 'favorite',
      icon: 'star',
      type: 'link',
      ID: 'favorite',
      order: 2
    },
    {
      name: 'exampleA',
      icon: 'bookmark',
      type: 'link',
      ID: 'exampleA',
      order: 3
    },
    {
      name: 'titleB',
      type: 'title',
      ID: 'tb',
      order: 4
    },
    {
      name: 'exampleB',
      icon: 'star',
      type: 'link',
      ID: 'b',
      order: 5
    },
    {
      name: 'exampleC',
      icon: 'star',
      type: 'link',
      ID: 'c',
      order: 6
    },
    {
      name: 'exampleD',
      icon: 'star',
      type: 'link',
      ID: 'd',
      order: 7
    },
  ];
  
  export const defaultBookmarks = [
    {
      name: 'YouTube',
      link: 'https://www.youtube.com/',
      icon: 'star',
      belongsTo: 'favorite'
    },
    {
      name: 'YouTubeMusic',
      link: 'https://music.youtube.com/',
      icon: 'player-play',
      belongsTo: 'favorite'
    },
    {
      name: 'Reddit',
      link: 'https://www.reddit.com/',
      icon: '',
      belongsTo: 'favorite'
    },
    {
      name: 'exampleA',
      link: 'https://www.youtube.com/',
      icon: '',
      belongsTo: 'exampleA'
    },
    {
      name: 'exampleBveeeeeeeeeeeeeeeeryyyyyyyyylonglonglongname',
      link: 'https://music.youtube.com/music.youtube.com/music.youtube.com/music.youtube.com/',
      icon: 'player-play',
      belongsTo: 'exampleA'
    },
    {
      name: 'exampleC',
      link: 'https://www.reddit.com/',
      icon: 'player-play',
      belongsTo: 'exampleA'
    },
    {
      name: 'YouTube',
      link: 'https://www.youtube.com/',
      icon: 'rotate-clockwise',
      belongsTo: 'favorite'
    },
    {
      name: 'YouTubeMusic',
      link: 'https://music.youtube.com/',
      icon: 'rotate-clockwise',
      belongsTo: 'favorite'
    },
    {
      name: 'Reddit',
      link: 'https://www.reddit.com/',
      icon: '',
      belongsTo: 'favorite'
    },
    {
      name: 'exampleA',
      link: 'https://www.youtube.com/',
      icon: 'rotate-clockwise',
      belongsTo: 'exampleA'
    },
    {
      name: 'exampleB',
      link: 'https://music.youtube.com/',
      icon: '',
      belongsTo: 'exampleA'
    },
    {
      name: 'exampleC',
      link: 'https://www.reddit.com/',
      icon: 'rotate-clockwise',
      belongsTo: 'exampleA'
    },
  ];
  
  export const defaultUserSettings = [
    {
      name: 'theme',
      themeList: ['darkTheme', 'lightTheme'],
      activeTheme: 0
    }
  ]