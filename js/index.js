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
var DEBUG_MODE = false;

var utilities = {
    getUlHtmlTag : function(listID){
        var ulHtmlTag = '<ul data-role="listview" data-split-icon="delete" id="'+ listID + '">';
        return ulHtmlTag;
    },

    getLiHtmlTag : function(liId){
        return '<li><a href="#" class="no-offsets"><input type="checkbox" id="' +  liId+ '" name="' + liId +
                            '"><label class="custom-checkbox" for="'+ liId+ '">' + liId +
                            '</label></input></a><a href="#"></a></li>';
    },

    getUlClosingTag : function(){
        return "</ul>";
    }
}

/* this method is used to convert all array elements into unordered list HTML tag where list items are represented by array elements.
Note that this method have been added to the Array object in JS so that any array can inherit this method and use it properly. */
Array.prototype.toUnorderedList = function(listViewId){
    console.log("toUnorderedList is called");

    var unorderedListTag = utilities.getUlHtmlTag(listViewId);
    for (var i=0; i<this.length; i++){
        unorderedListTag += utilities.getLiHtmlTag(this[i]);
    }
    unorderedListTag += utilities.getUlClosingTag();

    return unorderedListTag;
}

var shopping = {

    //local storage key name.
    localStorageKey : "grocery-show0017",
    listOfGroceries : [],
    listViewId      : "shoppingListView",

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
            //document.addEventListener('DOMContentLoaded', this.onDeviceReady, false);
        }

    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        shopping.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.debug('Received Event: ' + id);

        $("#new-item-btn").on("click", this.onAddNewItem);
        if(DEBUG_MODE)
            this.listOfGroceries = ["apple","pinapple","milk"];
        else
            this.listOfGroceries = this.getItemsFromLocalStorage();
        if(null !== this.listOfGroceries){
            console.log("key has value. Create listview");
            var unorderedListHTML_Tag = this.listOfGroceries.toUnorderedList(this.listViewId);

        }else{
            console.debug("key has no value");
            /*Reset list to empty array instead of null. */
            this.listOfGroceries = [];

            /* create listview tag before adding any new items from the user. */
            var unorderedListHTML_Tag = utilities.getUlHtmlTag(this.listViewId) +
                                        utilities.getUlClosingTag();
        }

        $(".ui-content").append(unorderedListHTML_Tag);
    },

    onAddNewItem : function(){
        var newItem = shopping.getTxtInput();
        console.log("Add item to listview");
        shopping.addItemToListView(newItem);
        console.log("Add item to list");
        shopping.addItemToList(newItem);
        console.log("Add item to localStorage");
        console.log(this);
        shopping.addItemToLocalStorage();
        console.log("clear text field");
        shopping.clearTxtField();
    },

    getTxtInput : function(){
        return $("#item").val();
    },

    clearTxtField : function(){
        $("#item").val("");
    },

    addItemToListView : function(newItem){
        var newItemLiTag = utilities.getLiHtmlTag(newItem);
        /* If you manipulate a listview via JavaScript (e.g. add new LI elements), you must call the refresh method on it to update the
            visual styling. But I found that the checkbox input misses some jquery-mobile classes so trigger listview creation event
            to load listview again and apply these missing classes.
        */
        $('#'+this.listViewId).append(newItemLiTag).listview("refresh").trigger("create");
    },

    addItemToList : function(newItem){
        /* Make sure that the item is not saved before */
        if(-1 === shopping.listOfGroceries.indexOf(newItem)){
            shopping.listOfGroceries.push(newItem);
        }else{
            console.warn("Display popup to the user about duplicate value");
            /*TODO: dispaly warning dialog/popup to the user about the duplicated value. */
        }
        console.debug(shopping.listOfGroceries);
    },

    addItemToLocalStorage : function(){
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.listOfGroceries));
    },

    getItemsFromLocalStorage : function(){
        return JSON.parse(localStorage.getItem(this.localStorageKey));
    }
};

shopping.initialize();
