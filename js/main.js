'use strict';

//fadeIn body when the page is loaded
$(document).ready(() => {
  $('body').css('opacity', 1);

  //position the playList on the home page
  setTimeout(() => {
    // $('.track[data="5"]').addClass('selectedSong');
    // const songIconOffset = $('#sound').offset().top;
    // const position = $('.selectedSong').offset().top;
    // const scrollSongTo = position - songIconOffset;
    // document.getElementById('playlistSectionHolder').scrollTop = scrollSongTo;
  });
});



var app = angular.module('app', []);

app.controller('ctrl', ['$rootScope', '$scope', '$interval', '$timeout', 'animation', 'task', 'data', function($rootScope, $scope, $interval, $timeout, animation, task, data){
  //second the song plays (help calculate the progression bar)
  $rootScope.musicFinishTime = 269;
  //used to calculate the progression bar length on the home page
  $rootScope.musicCurrentTime = 0;
  //used to calculate the progression bar length on the home page
  $rootScope.playingPercent = 0;
  //the length of the song progression bar on the home page
  $rootScope.playingBarWidth = '0em';
  //track if the song is playing
  $rootScope.playMusic = false;
  //the default img that is displayed on the home page
  $rootScope.featureImg = './img/artistFeature/WillAmaze.png';
  //current page
  $rootScope.currentPage = 'home';
  //navigation options
  $rootScope.navigationOptions = data.navigationOptions;

  //inline styling
  $rootScope.homePageLargeTextPStyle = '';
  $rootScope.featuredArtistStyle = '';
  $rootScope.homePageStyle = '';
  $rootScope.aboutScreenStyle = '';
  $rootScope.aboutImgStyle = '';
  $rootScope.aboutPageStyle = '';
  $rootScope.artistPageStyl = '';
  $rootScope.servicesPageStyle = '';
  $rootScope.servicesPageLeftSideStyle = '';
  $rootScope.servicesPageRightSideStyle = '';
  $rootScope.contactPageStyle = '';
  $rootScope.contactPageLeftSideStyle = '';
  $rootScope.contactPageRightSideStyle = '';

  $scope.currentArtistIndex = '';
  $scope.staff = data.staff;
  $scope.staffImg = './img/outline.png';
  $scope.hideLogo = false;

  $scope.toggleMusic = () => {
    //restart song if at the end of the song
    ($rootScope.musicCurrentTime === $rootScope.musicFinishTime) ? $rootScope.musicCurrentTime = 0 : null;
    //toggle the play btn
    $rootScope.playMusic = !$rootScope.playMusic;
    ($rootScope.playMusic) ? $rootScope.audio1.play() : $rootScope.audio1.pause();
    //start the play bar progression
    ($scope.playMusic) ? animation.playMusic() : animation.pauseMusic();
  }
  //access the data for the home page
  $rootScope.playList = data.playList;

  //set the initial song
  $timeout(() => {
    const songIndex = 6;
    task.setMusic($rootScope.playList[songIndex], songIndex);
    task.scrollSongInPlace(songIndex);
  }, 1000)

  //triggered by when selecting to song from the home page
  $scope.playSong = (data) => {
    ($rootScope.playMusic) ? $scope.toggleMusic() : null;
    task.setMusic($rootScope.playList[data], data);
    $scope.toggleMusic();
    task.scrollSongInPlace(data);
  }
  //navigate website
  $scope.navigateTo = (page, hasInitiallyLoaded) => {
    $scope.hideLogo = (page === 'services') ? true : false;
    //return null if already on page
    if((page === $rootScope.currentPage) && !hasInitiallyLoaded){ return null }
    //hide homePage while transitioning if initially loaded
    if(hasInitiallyLoaded){
      $timeout(() => {
        $('#homePage').removeClass('fade');
      }, 500)
    }

    //fade the logo opacity on different pages for contrast
    // const opacity = ((page === 'artist') || (page === 'services') || (page === 'contact')) ? 0 : 0.1;
    // $('#logo img').css('opacity', opacity);

    //hide the navigation until done transitioning pages
    $('#navigation').fadeOut(500);

    //transition from the current page
    animation.navigationFrom(data.navigationAnimations[$rootScope.currentPage]);
    //transition to the next page
    animation.navigationTo(page, data.navigationAnimations[page]);

    //set artist to default if going to artist page
    if(page === 'artist'){
      //the index of the artist to show when initially going to the artist page
      const indexOfArtistToShowFirst = 6;
      $timeout(() => { $scope.moveSlider(indexOfArtistToShowFirst); }, 1000)
    }

    //wait for page to refresh to add the active class to the navigation page
    $timeout(() => {
      //clear the active page class from all navigation options
      $('.navigationOption').removeClass('active');
      //current page index
      const index = task.findIndexOfPageByName(page, data.navigationOptions);
      //add the active class to the clicked navigation option
      $('.navigationOption[data="' + index + '"]').addClass('active');
    })
  }
  task.hidePages(data.navigationOptions);
  //services
  $scope.services = data.services;
  //slideshow methods
  $scope.artists = data.artists;
  $scope.currentArtist = data.artists[6];
  $scope.moveSlider = (index) => {
    $scope.currentArtistIndex = index;
    $scope.currentArtist = data.artists[index];
    task.slideItem(index);
  }
  $timeout(() => {
    const hasInitiallyLoaded = true;
    $scope.navigateTo('home', hasInitiallyLoaded);
    task.preScrollSlider();
    $('#navigation').removeClass('none');
  })
  task.setArtistImgs(data.artists);
}]);

app.service('animation', function($rootScope, $interval, $timeout, data, task){
  //used as the interval when calculating the progression bar on the home page
  this.playing;
  //continue the progression bar and play music on the home page
  this.playMusic = () => {
    $rootScope.musicCurrentTime++;
    task.playingPercent();
    $timeout(() => {
      task.resizeTimer();
    }, 200)
    this.playing = $interval(() => {
      $rootScope.musicCurrentTime++;
      task.playingPercent();
      task.resizeTimer();
      if($rootScope.musicCurrentTime === $rootScope.musicFinishTime){
        this.pauseMusic();
      }
    }, 1000);
  }
  //pause the progression bar and pause music on the home page
  this.pauseMusic = () => {
    $interval.cancel(this.playing);
    $rootScope.playMusic = false;
  }
  this.navigationFrom = (animationObj) => {
    animationObj.map((animation) => {
      const $rootScopeSelector = animation['$rootScopeSelector'];
      $rootScope[$rootScopeSelector] = animation['animation'];
    })
  }
  this.navigationTo = (selector, animationObj) => {
    const selected = "#" + selector + 'Page';
    const currentPage = "#" + $rootScope.currentPage + 'Page';

    $timeout(() => {
      $(currentPage).addClass('none');
      $(selected).addClass('transitioning').removeClass('none');
      animationObj.map((animation) => {
        const $rootScopeSelector = animation['$rootScopeSelector'];
        $rootScope[$rootScopeSelector] = animation['animation'];
      })

      $(selected).removeClass('transitioning');

      $rootScope.currentPage = selector;
      $timeout(() => {
        animationObj.map((animation) => {
          const $rootScopeSelector = animation['$rootScopeSelector'];
          $rootScope[$rootScopeSelector] = '';
        })
        $('#navigation').fadeIn(500);
      }, 100)
    }, 800)
  }
});

app.service('data', function(){
  this.playList = [
    {
      artist: 'Will Amaze',
      track: 'Will Amaze - Shooting Star',
      songLocation: './music/Will Amaze - Shooting Star.mp3',
      imgLocation: './img/artistFeature/resized500h/WillAmaze.png',
      secondsInSong: 269,
    },
    {
      artist: 'TyKeeL',
      track: 'Young Ty - Pop Star',
      songLocation: './music/Young Ty - Pop Star.mp3',
      imgLocation: './img/artistFeature/resized500h/Ty.png',
      secondsInSong: 171,
    },
    {
      artist: 'KMCB',
      track: 'KMCB - Shining',
      songLocation: './music/KMCB Shining.mp3',
      imgLocation: './img/artistFeature/resized500h/MistaCashmere.png',
      secondsInSong: 227,
    },
    {
      artist: 'Bahbean',
      track: 'Bahbean - Heartbreak',
      songLocation: './music/Bahbean_Single__Heartbreak.mp3',
      imgLocation: './img/artistFeature/resized500h/bb.png',
      secondsInSong: 267,
    },
    {
      artist: 'Will Amaze',
      track: 'Will Amaze - Do It',
      songLocation: './music/Will Amaze - Do It.mp3',
      imgLocation: './img/artistFeature/resized500h/WillAmaze.png',
      secondsInSong: 230,
    },
    {
      artist: 'TyKeeL',
      track: 'Young Ty - Luke Kage',
      songLocation: './music/Young Ty Luke Kage.mp3',
      imgLocation: './img/artistFeature/resized500h/Ty.png',
      secondsInSong: 216,
    },
    {
      artist: 'YQ Dreams ft Nae\' Ahmi',
      track: 'YQ Dreams - Dream',
      songLocation: './music/YQ- Dream Mp3.mp3',
      imgLocation: './img/artistFeature/resized500h/YQDreaMs.png',
      secondsInSong: 240,
    },
    {
      artist: 'Bahbean',
      track: 'Bahbean - Magic',
      songLocation: './music/Bahbean - Magic.mp3',
      imgLocation: './img/artistFeature/resized500h/bb.png',
      secondsInSong: 206,
    },
    {
      artist: 'YQ Dreams ft Nae\' Ahmi',
      track: 'YQ Dreams - No Love',
      songLocation: './music/YQ - No Love Master.mp3',
      imgLocation: './img/artistFeature/resized500h/YQDreaMs.png',
      secondsInSong: 172,
    },
    {
      artist: 'Nae\'Ahmi',
      track: 'Nae\'Ahmi - Creepin',
      songLocation: './music/Nae\' Ahmi Creepin.mp3',
      imgLocation: './img/artistFeature/resized500h/Nae.png',
      secondsInSong: 226,
    },
    {
      artist: 'Bahbean',
      track: 'Bahbean - Bad Blood',
      songLocation: './music/Bad Blood Master.mp3',
      imgLocation: './img/artistFeature/resized500h/bb.png',
      secondsInSong: 163,
    },
    {
      artist: 'TyKeeL',
      track: 'Young Ty - Monstar',
      songLocation: './music/Young Ty - Monstar.mp3',
      imgLocation: './img/artistFeature/resized500h/Ty.png',
      secondsInSong: 143,
    },
    {
      artist: 'YQ Dreams ft Nae\' Ahmi',
      track: 'YQ Dreams ft Nae\' Ahmi - Changing',
      songLocation: './music/YQ Dreams featuring Nae\' Ahmi (They Changin)(MASTER).mp3',
      imgLocation: './img/artistFeature/resized500h/YQDreaMs.png',
      secondsInSong: 269,
    },

  ];
  this.navigationAnimations = {
    home: [
      { $rootScopeSelector: 'homePageLargeTextPStyle', animation: 'position: relative;transition: opacity 0.5s, left 1s;opacity: 0;left: 100%;'},
      { $rootScopeSelector: 'featuredArtistStyle', animation: 'left: -40em;transition: left 0.5s;'},
      { $rootScopeSelector: 'homePageStyle', animation: 'opacity: 0;transition: opacity 0.5s;'}
    ],
    about: [
      { $rootScopeSelector: 'aboutScreenStyle', animation: 'top: -20rem;transition: top 1s;'},
      { $rootScopeSelector: 'aboutImgStyle', animation: 'right: -40em;transition: right 0.5s;'},
      { $rootScopeSelector: 'aboutPageStyle', animation: 'opacity: 0;transition: opacity 0.5s;'}
    ],
    artist: [
      { $rootScopeSelector: 'artistPageStyle', animation: 'opacity: 0;transition: opacity 0.5s;'}
    ],
    services: [
      { $rootScopeSelector: 'servicesPageStyle', animation: 'opacity: 0;transition: opacity 0.5s;'},
      { $rootScopeSelector: 'servicesPageLeftSideStyle', animation: 'top: 20rem;transition: top 1s;'},
      { $rootScopeSelector: 'servicesPageRightSideStyle', animation: 'opacity: 0;transition: opacity 0.5s;'}
    ],
    contact: [
      { $rootScopeSelector: 'contactPageStyle', animation: 'opacity: 0;transition: opacity 0.5s;'},
      { $rootScopeSelector: 'contactPageLeftSideStyle', animation: 'opacity: 0;transition: opacity 0.5s;'},
      { $rootScopeSelector: 'contactPageRightSideStyle', animation: 'top: 20rem;transition: top 1s;'}
    ],
    staff: [
      { $rootScopeSelector: 'staffPageStyle', animation: 'opacity: 0;transition: opacity 0.5s;'}
    ]
  }
  this.artists = [
    {
      sign: '<<',
      name: '',
      img: '',
      bio: ''
    },
    {
      name: 'Young Ty',
      img: './img/artistBio/Ty.png',
      bio: 'Young Ty, aka “TyKeel” is a 13 year old rapper blazing out of Philadelphia and going toe to toe with some of the best. He has been rapping since conception and now he is launching his professional career with No Baggage Records, LLC. His new single is “Luke Kage.”'
    },
    {
      name: 'YQ Dreams',
      img: './img/artistBio/YQDreaMs.png',
      bio: 'YQ Dreams, aka “Young Quan” is a rising Hip-Hop Rap Artist with a large following in New Jersey and Philadelphia. YQ has collaborated with producers such as ImASaynt and CMPLX. YQ is taking his career to the next level by working with No Baggage Records, LLC. His new single is “Changing” featuring the lovely songbird, Nae’Ahmi.'
    },
    {
      name: 'KMCB',
      img: './img/artistBio/MistaCashmere.png',
      bio: 'KMCB, aka Mista Cashmere is a rising star out of Philadelphia. KMCB comes from a talented family and he is true to his family name.  KMCB’s lyrics are influenced by his difficult childhood and are captivating and grabs hold of you.  In addition to writing for his own projects, KMCB is a talented ghostwriter for many.  KMCB was recently signed to NO Baggage Records, LLC and he is now ready for his chance at greatness.  His new single is “Shining.”'
    },
    {
      name: 'QuadS',
      img: './img/artistBio/QuadS.png',
      bio: 'Quads is really a triple threat, he can sing, dance and rap.  He is well known in New Jersey with an increasing following from Philadelphia.  Quads started his musical career performing with his brother Zey who is also a NO Baggage Records, LLC artist.'
    },
    {
      name: 'Will Amaze',
      img: './img/artistBio/WillAmaze.png',
      bio: 'Will Amaze is a seasoned Kingdom Rap Artist and he is leveling up his career with No Baggage Records, LLC. He is truly an AMAZING artist with remarkable word play and inspirational lyrics (always with a profound message). His new single is “Do It.”'
    },
    {
      name: 'Nae\'Ahmi',
      img: './img/artistBio/Nae.png',
      bio: 'Nae’Ahmi is a young ascending star with an angel like voice spiced with an edgy hypnotic sound. She started her career singing in church and now she is launching her professional career with No Baggage Records, LLC. Her new single is “Creeping.”'
    },
    {
      name: 'BahBean',
      img: './img/artistBio/bb.png',
      bio: 'Bahbean is a conscious lyrical Rap Artist and widely known throughout the tristate area of New Jersey, Pennsylvania, Delaware, and worldwide. Bahbean’s musical style is influenced mostly from his hardships and obstacles in life. He was one of the first Artists signed to No Baggage Records, LLC. His new single is “Magic.”'
    },
    {
      sign: '>>',
      name: '',
      img: ''
    }
  ]
  this.navigationOptions = [
    {index: 0, selector: '#homePage', name: 'HOME'},
    {index: 1, selector: '#aboutPage', name: 'ABOUT'},
    {index: 2, selector: '#artistPage', name: 'ARTIST'},
    {index: 3, selector: '#servicesPage', name: 'SERVICES'},
    {index: 4, selector: '#contactPage', name: 'CONTACT'},
    {index: 5, selector: '#staffPage', name: 'STAFF'}
  ]
  this.services = [
    'Artist Development',
    'Consulting',
    'Studio Time',
    'Post to Final Production'
  ]
  this.staff = [
    {
      section: {
        friendlyName: "Executive Team",
        people: [
          {name: 'Telissa K. Lindsey', description: 'Chief Executive Officer'},
          {name: 'D. Lindsey', description: 'Chief Operating Officer'}
        ]
      }
    },
    {
      section: {
        friendlyName: "Administrative Team",
        people: [
          {name: 'Karima Keel', description: 'Events Coordinator', imgLocation: './img/outline.png'},
          {name: 'Tameka Combs', description: 'Events Coordinator', imgLocation: './img/outline.png'},
          {name: 'Amanda Ziegenfuss', description: 'Production Assistant', imgLocation: './img/outline.png'}
        ]
      }
    },
    {
      section: {
        friendlyName: "Production Team",
        people: [
          {name: 'B.Arsin', description: 'Producer and Chief Engineer', imgLocation: './img/outline.png'},
          {name: 'Martin Nwoga', description: 'Production Manager', imgLocation: './img/outline.png'},
          {name: 'Clarence English', description: 'Producer and Songwriter', imgLocation: './img/outline.png'},
          {name: 'Chap Smith', description: 'Producer', imgLocation: './img/outline.png'},
          {name: 'Troy "Tk Izrael" Lindsey', description: 'Producer', imgLocation: './img/outline.png'}
        ]
      }
    },
    {
      section: {
        friendlyName: "Kingdom Department",
        people: [
          {name: 'Will Amaze', description: 'Program Manager and Songwriter', imgLocation: './img/outline.png'},
          {name: 'Gerry Duperroy', description: 'Producer and Songwriter', imgLocation: './img/outline.png'}
        ]
      }
    },
    {
      section: {
        friendlyName: "Security Staff",
        people: [
          {name: 'Grimm', description: 'Security', imgLocation: './img/outline.png'}
        ]
      }
    }
  ]
});

//task service
app.service('task', function($rootScope, $interval, $timeout){
  //calculate the percentage of music that is played on the home page
  this.playingPercent = () => {
    $rootScope.playingPercent = $rootScope.musicCurrentTime/$rootScope.musicFinishTime;
  }
  //lengthens the progression bar on the home page as the music plays
  this.resizeTimer = () => {
    const fullWidth = 8.8;
    $rootScope.playingBarWidth = fullWidth * $rootScope.playingPercent + 'em';
  }
  //sets the music to be played on the homepage
  this.setMusic = (playList, data) => {
    $rootScope.featureImg = $rootScope.playList[data]['imgLocation'];
    $rootScope.musicCurrentTime = 0;
    $rootScope.playingPercent = 0;
    $rootScope.musicFinishTime = playList['secondsInSong'];
    $rootScope.audio1 = '';
    $rootScope.audio1 = new Audio(playList['songLocation']);
  }
  //scroll to the selected song on the home page
  this.scrollSongInPlace = (data) => {
    document.getElementById('playlistSectionHolder').scrollTop = 0;
    $('.track').removeClass('selectedSong');
    $('.track[data="' + data + '"]').addClass('selectedSong');
    const songIconOffset = $('#sound').offset().top;
    const position = $('.selectedSong').offset().top;
    const scrollSongTo = position - songIconOffset;
    document.getElementById('playlistSectionHolder').scrollTop = scrollSongTo;
  }
  //hide all page except the homepage
  this.hidePages = (navigationOptions) => {
    navigationOptions.map((data, index) => {
      if(index > 0){
        $(data.selector).addClass('none');
      }
    })
  }
  ////////slider methods
  this.preScrollSlider = () => {
    this.slideItem(1);
  }
  this.slideItem = (index) => {
    //remove the selected class from all sildes
    $('.slideItems').removeClass('selectedSlide');
    //add the slider class to target
    $('.slideItems[data="' + index + '"]').addClass('selectedSlide');
    //with of the slider item
    const itemContainerWidth = $('.slideItems').width();
    //th position to slide the parent element
    const slidePosition = (itemContainerWidth * (index - 1));
    //animate slider
    $('#slideShowContainer').animate({ scrollLeft: slidePosition }, 500);
    //scroll to the initial position without animation
    //document.getElementById('slideShowContainer').scrollLeft = (itemContainerWidth * (index - 1));
  }
  ////////end: slider methods
  this.setArtistImgs = (items) => {
    $timeout(() => {
      items.map((data, index) => {
        const test = $('.slideItems[data="' + index + '"]');
        $('.slideItems[data="' + index + '"]').css('backgroundImage', "url('" + data.img + "')");
      }, 1000)
    })
  }
  this.findIndexOfPageByName = (page, navigationOptions) => {
    let index = null;
    navigationOptions.map((data) => {
      if(data.name.toLowerCase() === page){
        index = data.index;
      }
    })
    return index;
  }
});
