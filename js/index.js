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

    pickedItemsLocalStorageKey : "picked-grocery-show0017",
    listOfPickedItems : [],
    pickedItemsListViewId : "pickedItemsListView",

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

        /* pass the list by reference not by value to keep changes outside the function body afterwards. */
        this.listViewCreate("listOfGroceries", this.localStorageKey, this.listViewId, '<div class="items-to-buy"><h4>List of items to buy</h4>');
        this.listViewCreate("listOfPickedItems", this.pickedItemsLocalStorageKey, this.pickedItemsListViewId, '<div class="picked-items"><h4>List of picked items</h4>');

    $('.container').width("100%").height("500").split({
        orientation: 'horizontal',
        limit: 10,
        position: '50%'
    });

    },

    listViewCreate : function(listKey, key ,listViewId, listViewTitle ){
        console.log("listViewCreate with id: "+listViewId);
        /* Get list of grocery items that are saved in local storage (if any) then create listview. */
        shopping[listKey] = this.getItemsFromLocalStorage(key);
        if(null !== shopping[listKey] && 0 !== shopping[listKey].length){
            console.log("local storage key has valid value");
            console.log(shopping[listKey].length);
            var listViewHtmlTag = listViewTitle + shopping[listKey].toUnorderedList(listViewId);
        }else{
            console.debug("local storage key has empty value");
            /*Reset list to empty array instead of null. */
            shopping[listKey] = [];

            /* create listview tag before adding any new items from the user. */
            var listViewHtmlTag = listViewTitle + utilities.getUlHtmlTag(listViewId) +
                                        utilities.getUlClosingTag() + '</div>';
        }

        $(".container").append(listViewHtmlTag);
        $("#"+listViewId).listview().listview("refresh");

        /* set click listeners for remove button and checkbox after creating listview. */
        var removeBtnSelectors = "#"+listViewId + " li a.ui-icon-delete";
        var checkBoxSelectors = "#"+listViewId + ' li a input[type="checkbox"]';

        shopping.updateListViewListeners(removeBtnSelectors , checkBoxSelectors);
    },

    updateListViewListeners : function(selectorRemove, selectorCheckBox){
        $(selectorRemove).on("click", shopping.onRemoveItem);
        $(selectorCheckBox).on("click",shopping.onItemCompleted);
    },

    onAddNewItem : function(event){
        event.preventDefault();
        var newItem = shopping.getTxtInput();
        shopping.addItemToListView (shopping.listViewId      , newItem);
        shopping.addItemToList     (shopping.listOfGroceries , newItem);
        shopping.updateLocalStorage(shopping.localStorageKey, shopping.listOfGroceries);
        shopping.clearTxtField();
    },

    onRemoveItem : function(event){
        event.preventDefault();
        console.debug("delete btn is clicked");
        var liJQueryObj = $(this).parent();
        var index = $("li").index(liJQueryObj);
        console.debug("index to be removed is: " + index);

        /* Determine which listview is pressed and accordingly which list that would be processed.*/
        var pairs = shopping.getListViewId_ListPairs(index);

        /* Remove item from listview, list and local storage. */
        shopping.removeItemFromListView(pairs["listViewId"], liJQueryObj);
        shopping.removeItemFromList(pairs["list"], index);
        shopping.updateLocalStorage(pairs["key"], pairs["list"]);
    },

    onItemCompleted : function(event){
        console.log("Check box is clicked");
        var checkboxJQueryObj = $(this);
        var index = $(":checkbox").index(checkboxJQueryObj);
        console.debug("index checked is: "+ index);

        /* Determine which listview is pressed and accordingly which list that would be processed.*/
        var pairs = shopping.getListViewId_ListPairs(index);

        shopping.removeItemFromListView(pairs["listViewId"], index);
        shopping.removeItemFromList(pairs["list"], index);
    },

    getListViewId_ListPairs : function(index){
        if(index < shopping.listOfGroceries.length){
            return {"listViewId":shopping.listViewId , "list":shopping.listOfGroceries, "key":shopping.localStorageKey};
        }else{
            /*TODO: set listview id and list for picked items*/
            return null;
        }
    },

    getTxtInput : function(){
        return $("#item").val();
    },

    clearTxtField : function(){
        $("#item").val("");
    },

    addItemToListView : function(listViewId, newItem){
        var newItemLiTag = utilities.getLiHtmlTag(newItem);
        /* If you manipulate a listview via JavaScript (e.g. add new LI elements), you must call the refresh method on it to update the
            visual styling. But I found that the checkbox input misses some jquery-mobile classes so trigger listview creation event
            to load listview again and apply these missing classes.
            Another performant way is to refresh the checkbox and listview to update new items only instead of triggering creation
            event for the whole listview.
        */

        /* For some reason, when I programtically trigger the event of listview creation, it did not invoke onListViewCreate!!*/
//        $('#'+this.listViewId).append(newItemLiTag).listview("refresh").trigger("create");
        $('#'+listViewId).append(newItemLiTag).listview("refresh");
        $('input[type="checkbox"]').checkboxradio().checkboxradio("refresh");

        /*Note that it is mandatory to select last child only otherwise click handler would be registered multiple times for the same
        button which leads to unexpected results.*/
        var removeBtnSelector = "#"+listViewId + " li:last a.ui-icon-delete";
        var checkBoxSelector = "#"+listViewId + ' li:last a input[type="checkbox"]';
        shopping.updateListViewListeners(removeBtnSelector, checkBoxSelector);
    },

    removeItemFromListView : function(listViewId, indexOrObj){

        if( "number" === typeof indexOrObj){
            var liJqueryObj = $("#"+listViewId + " li").get(indexOrObj);
            var checkboxJQueryObj = $("#"+listViewId + " :checkbox").get(indexOrObj);
        }else{
            var liJqueryObj = indexOrObj;
        }

        $(liJqueryObj).remove();

        /*refresh checkbox if list item is removed due to shopping item completed. */
        if (checkboxJQueryObj)
            $(checkboxJQueryObj).checkboxradio().checkboxradio("refresh");

        /* refresh listview after removing any item. */
        $('#'+listViewId).listview("refresh");
    },

    addItemToList : function(list, newItem){
        /* Make sure that the item is not saved before */
        if(-1 === list.indexOf(newItem)){
            list.push(newItem);
        }else{
            console.warn("Display popup to the user about duplicate value");
            /*TODO: dispaly warning dialog/popup to the user about the duplicated value. */
        }
//        console.debug(shopping.listOfGroceries);
    },

    removeItemFromList : function(list,index){
        var NUM_OF_ELEMENTS = 1; // number of elements to be removed from array.
        list.splice(index, NUM_OF_ELEMENTS);
//        console.debug(shopping.listOfGroceries);
    },

    updateLocalStorage : function(key,list){
        localStorage.setItem(key, JSON.stringify(list));
    },

    getItemsFromLocalStorage : function(key){
        return JSON.parse(localStorage.getItem(key));
    }
};

shopping.initialize();
//$(document).ready(function(){
//
//    $('#container').width(700).height(400).split({
//        orientation: 'horizontal',
//        limit: 10
//
//    });
//});

