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
//    console.log("toUnorderedList is called");

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

        /* set click listener for add button. */
        $("#new-item-btn").on("click", this.onAddNewItem);

        /* set click listener for remove/done buttons in case list of groceries is not empty. Need to set same listeners for
            dynamically created items inside addItemToListView method. */
        $(document).on("listviewcreate", this.onListViewCreate);

        /* Get list of grocery items that are saved in local storage (if any) then create listview. */
        this.listOfGroceries = this.getItemsFromLocalStorage();
        if(null !== this.listOfGroceries){
//            console.log("key has value. Create listview");
            var unorderedListHTML_Tag = this.listOfGroceries.toUnorderedList(this.listViewId);
        }else{
//            console.debug("key has no value");
            /*Reset list to empty array instead of null. */
            this.listOfGroceries = [];

            /* create listview tag before adding any new items from the user. */
            var unorderedListHTML_Tag = utilities.getUlHtmlTag(this.listViewId) +
                                        utilities.getUlClosingTag();
        }

        $(".ui-content").append(unorderedListHTML_Tag);
    },

    onListViewCreate : function(event, ui){
//        console.log("list view is created");
        /* upon creation of listview, set click listener for the delete button and checkbox */
        var removeBtnSelectors = "#"+shopping.listViewId + " li a.ui-icon-delete";
        var checkBoxSelectors = "#"+shopping.listViewId + ' a input[type="checkbox"]';
        shopping.updateListViewListeners(removeBtnSelectors , checkBoxSelectors);
    },

    updateListViewListeners : function(selectorRemove, selectorCheckBox){
        $(selectorRemove).on("click", shopping.onRemoveItem);
        $(selectorCheckBox).on("click",shopping.onItemCompleted);
    },

    onAddNewItem : function(event){
        event.preventDefault();
        var newItem = shopping.getTxtInput();
        shopping.addItemToListView(newItem);
        shopping.addItemToList(newItem);
        shopping.updateLocalStorage();
        shopping.clearTxtField();
    },

    onRemoveItem : function(event){
        console.debug("delete btn is clicked");
        event.preventDefault();

        var liJQueryObj = $(this).parent();
        var index = $("li").index(liJQueryObj);
        console.debug("index to be removed is: " + index);

        shopping.removeItemFromListView(liJQueryObj);
        shopping.removeItemFromList(index);
        shopping.updateLocalStorage();
    },

    onItemCompleted : function(){
        console.log("Check box is clicked");
        var checkboxJQueryObj = $(this);
        var index = $("#"+shopping.listViewId + "  :checkbox").index(checkboxJQueryObj);
        console.debug("index checked is: "+ index);
        shopping.removeItemFromListView(index,checkboxJQueryObj);
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
            Another performant way is to refresh the checkbox and listview to update new items only instead of triggering creation
            event for the whole listview.
        */

        /* For some reason, when I programtically trigger the event of listview creation, it did not invoke onListViewCreate!!*/
//        $('#'+this.listViewId).append(newItemLiTag).listview("refresh").trigger("create");
        $('#'+this.listViewId).append(newItemLiTag).listview("refresh");
        $('input[type="checkbox"]').checkboxradio().checkboxradio("refresh");

        /* set click listners after adding new items to the endo of listview.
        Note that it is mandatory to select last child only otherwise click handler would be registered multiple times for the same
        button which leads to unexpected results.*/
        var removeBtnSelector = "#"+this.listViewId + " li:last a.ui-icon-delete";
        var checkBoxSelector = "#"+this.listViewId + ' li:last a input[type="checkbox"]';
        shopping.updateListViewListeners(removeBtnSelector, checkBoxSelector);
    },

    removeItemFromListView : function(indexOrObj, checkboxJQueryObj){

        if( "number" === typeof indexOrObj){
            var liJqueryObj = $("#"+shopping.listViewId + " li").get(indexOrObj);
        }else{
            var liJqueryObj = indexOrObj;
        }

        $(liJqueryObj).remove();
        checkboxJQueryObj.checkboxradio().checkboxradio("refresh");
        $('#'+this.listViewId).listview("refresh");
    },

    addItemToList : function(newItem){
        /* Make sure that the item is not saved before */
        if(-1 === shopping.listOfGroceries.indexOf(newItem)){
            shopping.listOfGroceries.push(newItem);
        }else{
            console.warn("Display popup to the user about duplicate value");
            /*TODO: dispaly warning dialog/popup to the user about the duplicated value. */
        }
//        console.debug(shopping.listOfGroceries);
    },

    removeItemFromList : function(index){
        var NUM_OF_ELEMENTS = 1; // number of elements to be removed from array.
        shopping.listOfGroceries.splice(index, NUM_OF_ELEMENTS);
//        console.debug(shopping.listOfGroceries);
    },

    updateLocalStorage : function(){
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.listOfGroceries));
    },

    getItemsFromLocalStorage : function(){
        return JSON.parse(localStorage.getItem(this.localStorageKey));
    }
};

shopping.initialize();
