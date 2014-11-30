/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var DEBUG_MODE = true;

/* this method is used to convert all array elements into unordered list HTML tag where list items are represented by array elements.
Note that this method have been added to the Array object in JS so that any array can inherit this method and use it properly. */
Array.prototype.toUnorderedList = function(){
    console.log("toUnorderedList is called");
    var unorderedListTag = '<ul data-role="listview" data-split-icon="delete">';
    for (var i=0; i<this.length; i++){
        unorderedListTag += '<li><a href="#">' + this[i] + '</a><a href="#"></a></li>';
    }
    unorderedListTag +="</ul>";
    return unorderedListTag;
}

var shopping = {

    //local storage key name.
    localStorageKey : "grocery-show0017",
    listOfGroceries : [],

    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {

        /* Check whether user runs application from Desktop browser or Device*/
        if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
            console.debug("Running application from device");
            document.addEventListener('deviceready', this.onDeviceReady, false);
        } else {
            console.debug("Running application from desktop browser");
            this.onDeviceReady();
        }

    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.debug('Received Event: ' + id);

        if(DEBUG_MODE)
            listOfGroceries = ["apple","pinapple","milk"];
        else
            listOfGroceries = JSON.parse(localStorage.getItem(this.localStorageKey));
        if(null !== listOfGroceries){
            console.log("key has value. Create listview");
            var unorderedListHTML_Tag = listOfGroceries.toUnorderedList();
            $(".ui-content").append(unorderedListHTML_Tag);

        }else{
            console.debug("key has no value");
        }
    }
};

shopping.initialize();
