import videojs from 'video.js';
import {version as VERSION} from '../package.json';

// Default options for the plugin.
const defaults = {};

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;
// const dom = videojs.dom || videojs;

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 *           A Video.js player object.
 *
 * @param    {Object} [options={}]
 *           A plain object containing options for the plugin.
 */
const onPlayerReady = (player, options) => {
  player.addClass('vjs-chapters-more');
  console.log("Chapters : ",options)
};

var getJSON = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  //xhr.responseType = 'json';
  xhr.onload = function() {
    var status = xhr.status;
    console.log(xhr)
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function chaptersMore
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const chaptersMore = function(options) {
  this.ready(() => {

    console.log("Plugin Started");
    var player = this;
    getJSON(options.src, function(err, data) {
    
      if (err != null) {
          console.error(err);
      } else {    
          var parsedData = JSON.parse(data)

          if(parsedData.length > 0){

              let chapterList = document.createElement("div");
              chapterList.className = "vjs-chapters-more-list fade-out-box ";
              
              parsedData.map(function(item, idx){
                console.log( parsedData[idx]['type'] )
                var chapterBox = createChapterBox(player, parsedData[idx]);
                chapterList.appendChild(chapterBox);
              });


              var controlBarHeight = player.controlBar.currentHeight();     
              player.on('playerresize' ,function(){//chapter panel resize
                var playerHeight = player.currentHeight();
                console.log(  "controlbar : ", player.controlBar )
                chapterList.style.height = (playerHeight - controlBarHeight) + "px";
                
              });
                    
              chapterList.style.bottom = controlBarHeight + "px";
              player.el().appendChild(chapterList); 


              // create chapter custom button
              var btnChapters = player.controlBar.addChild("button");

              var btnChaptersDom = btnChapters.el();
              btnChaptersDom.innerHTML = '<span class="vjs-icon-placeholder" aria-hidden="true"></span>';
              btnChapters.addClass("vjs-button");
              btnChapters.addClass("vjs-chapters-button");
              chapterList.style.display = 'none';
              btnChaptersDom.onclick = function(){
                  if( chapterList.classList.contains('fade-in-box') ){
                    
                    setTimeout(function(){
                      chapterList.style.display = 'none';
                    }, 500);                    
                    chapterList.classList.remove("fade-in-box");
                    chapterList.classList.add("fade-out-box");
                  }else{
                    chapterList.classList.add("fade-in-box");
                    chapterList.classList.remove("fade-out-box");
                    chapterList.style.display = '';
                    
                  }

              }  


          }
      }
    });

    onPlayerReady(this, videojs.mergeOptions(defaults, options));
  });
};

function createChapterBox(player, item){
  console.log(item)
  let chapterBox = document.createElement("div");
  chapterBox.className = 'box-chapter';
  var boxContent = document.createElement('div');;
  
  if(typeof item.thumbnail != null){
    var thumbnail = document.createElement('div');
    thumbnail.className = 'chapter-thumbnail fl'
    thumbnail.style.backgroundImage = "url('" + item.thumbnail + "')";
    boxContent.appendChild(thumbnail);
  }


  //define clear box
  var clearBox = document.createElement('div');
  clearBox.className = "cr";
  var innerBox = document.createElement('div');
  innerBox.className = "fl";

  var boxLabel = document.createElement('div');
  boxLabel.className = "chapter-label"
  var labelContent = document.createTextNode(item.label);
  boxLabel.appendChild(labelContent);
  
  var boxDesc = document.createElement('div');
  boxDesc.className = "chapter-desc"
  var desclContent = document.createTextNode(item.desc);
  boxDesc.appendChild(desclContent);

  innerBox.appendChild(boxLabel);
  innerBox.appendChild(boxDesc);

  boxContent.appendChild(innerBox);

  switch(item.type){
    case "text":
      chapterBox.addEventListener( 'click', function(){
        player.currentTime(item.start);
      });      
    break;
    case "link":
      chapterBox.addEventListener( 'click', function(){
        window.open(item.href);
      });
    break;

  }
  boxContent.appendChild(clearBox);

  chapterBox.appendChild(boxContent);
  return chapterBox;
}

// Register the plugin with video.js.
registerPlugin('chaptersMore', chaptersMore);

// Include the version number.
chaptersMore.VERSION = VERSION;

export default chaptersMore;
