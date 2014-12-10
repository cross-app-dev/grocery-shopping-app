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
    contentHeight : null,
    contentWidth : null,
    contentHeightLandscape : null,
    contentWidthLandscape  : null,
    getUlHtmlTag : function(listID){
        var ulHtmlTag = '<ul data-role="listview" data-split-icon="delete" id="'+ listID + '">';
        return ulHtmlTag;
    },

    getLiHtmlTag : function(liId, labelStyleClass){
        if(labelStyleClass){
            var labelHtmlTag = '<label class="custom-checkbox '+ labelStyleClass+ '" for="';
        }else{
            var labelHtmlTag = '<label class="custom-checkbox" for="';
        }

        return '<li><a href="#" class="no-offsets"><input type="checkbox" id="' +  liId+ '" name="' + liId +
                            '">'+ labelHtmlTag + liId+ '">' + liId +
                            '</label></input></a><a href="#"></a></li>';
    },

    getUlClosingTag : function(){
        return "</ul>";
    },

    getContentHeight: function(){
        var deviceHeight = $(window).height();
        console.debug("height of my device is: "+ deviceHeight);
        var headerHeight = $("div[data-role='header']:visible").outerHeight();
        console.debug("headerHeight = "+ headerHeight);
        var footerHeight = $("div[data-role='footer']:visible").outerHeight();
        console.debug("footerHeight = "+ footerHeight);
        var padding = parseInt($('.ui-content').css("padding"));
        console.log("padding is: ", padding);
//        this.contentHeight = deviceHeight-footerHeight-headerHeight - 2*padding;
        this.contentHeight = 450;
    },

    getContentWidth : function(){
//        this.contentWidth = $('.ui-content').width();
        this.contentWidth = 335;
    },

    getContentHeightLandscape: function(){
        var headerHeight = $("div[data-role='header']:visible").outerHeight();
        console.debug("headerHeight = "+ headerHeight);
        var footerHeight = $("div[data-role='footer']:visible").outerHeight();
        console.debug("footerHeight = "+ footerHeight);
//        this.contentHeightLandscape = $('.ui-content').width() - footerHeight - headerHeight;
        this.contentHeightLandscape = 200;
    },

    getContentWidthtLandscape : function(){
//        this.contentWidthLandscape = $(window).height();
        this.contentWidthLandscape = 585;
    }
}

/* this method is used to convert all array elements into unordered list HTML tag where list items are represented by array elements.
Note that this method have been added to the Array object in JS so that any array can inherit this method and use it properly. */
Array.prototype.toUnorderedList = function(listViewId){

    /* label for every checkbox must be decorated by line-through in case of creating listview for picked items*/
    var labelStyleClass = (listViewId === shopping.pickedItemsListViewId)?'picked-item':null;

    var unorderedListTag = utilities.getUlHtmlTag(listViewId);
    for (var i=0; i<this.length; i++){
        unorderedListTag += utilities.getLiHtmlTag(this[i], labelStyleClass);
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
    splitterObj : null,
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
            document.addEventListener('DOMContentLoaded', shopping.onDeviceReady, false);
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
        var CARRIAGE_RETURN_ASCII_CODE = 13;
        window.addEventListener("orientationchange", shopping.onOrientationChange, false);

        /* set click listener for add button. */
        $("#new-item-btn").on("click", this.onAddNewItem);
        $("#item").keypress(function(e){
                    var key = e.which || e.keyCode;
                    console.debug("Key is pressed");
                    if (CARRIAGE_RETURN_ASCII_CODE === key) {
                        e.preventDefault();
                        console.debug("Enter is pressed");
                        shopping.onAddNewItem();
                    }
             });

        var listViewGroceriesTitle = '<div class="items-to-buy"><h4>Wish List</h4>';
        /* pass the list by reference not by value to keep changes outside the function body afterwards. */
        this.listViewCreate("listOfGroceries",
                            this.localStorageKey,
                            this.listViewId,
                            listViewGroceriesTitle);

        var listViewPickedItemsTitle = '<div class="picked-items"><h4>Purchased Items</h4>';
        this.listViewCreate("listOfPickedItems",
                            this.pickedItemsLocalStorageKey,
                            this.pickedItemsListViewId,
                            listViewPickedItemsTitle);

        utilities.getContentWidth();
        utilities.getContentHeight();
        utilities.getContentHeightLandscape();
        utilities.getContentWidthtLandscape();
        /* Add dynamic spiltter between two listviews. By substracting footer height as well as footer height from device height,
            thus we can get the whole height of the content box at runtime for any device height.*/
        shopping.onOrientationChange();
    },

    onOrientationChange: function(){
        console.debug("inside onOrientationChange");
        switch(window.orientation){
                case 0:
                    console.log("Portrait");
                    /* Make sure if device orientation has been changed from Landscape to Portrait or this is initial orientation
                        upon running app for first time.*/
                    if(null !== shopping.splitterObj){
                        shopping.splitterObj.destroy();
                    }

                    console.log("content width is:" , utilities.contentWidth);
                    console.log("content height is:" , utilities.contentHeight);

                    shopping.splitterObj =
                        $('.container').width(utilities.contentWidth).
                            height(utilities.contentHeight).
                            split({
                                orientation: 'horizontal'
                            });
                    $('.ui-container').append($('.container'));
                    break;
                case 90:
                case -90:
                    console.log("Landscape");
                    /* Make sure if device orientation has been changed from Landscape to Portrait or this is initial orientation
                        upon running app for first time.*/
                    if(null !== shopping.splitterObj){
                        shopping.splitterObj.destroy();
                    }

                    console.log("content height is:", utilities.contentHeightLandscape);
                    console.log("content width is:" , utilities.contentWidthLandscape);

                    shopping.splitterObj =
                        $('.container').width(utilities.contentWidthLandscape).
                        height(utilities.contentHeightLandscape).
                        split({
                            orientation: 'vertical'
                        });
                    $('.ui-container').append($('.container'));
                    break;
        }
    },

    listViewCreate : function(listKey, key ,listViewId, listViewTitle ){
        console.log("listViewCreate with id: "+listViewId);
        /* Get list of grocery/picked items that are saved in local storage (if any). */
        shopping[listKey] = this.getItemsFromLocalStorage(key);
        if(null !== shopping[listKey]){
            console.log("local storage key has valid value");
            var listViewHtmlTag = listViewTitle + shopping[listKey].toUnorderedList(listViewId);
        }else{
            console.debug("local storage key has empty value");
            /*Reset list to empty array instead of null. */
            shopping[listKey] = [];

            /* create listview tag before adding any new items from the user. */
            var listViewHtmlTag = listViewTitle + utilities.getUlHtmlTag(listViewId) +
                                    utilities.getUlClosingTag() +
                                    '</div>'; /*closing tag for div that contains title and listview itself. This is required for
                                                 splitting the two listviews.*/
        }

        $(".container").append(listViewHtmlTag);
        $("#"+listViewId).listview().listview("refresh");
        $('#'+listViewId+' input[type="checkbox"]').checkboxradio().checkboxradio("refresh");

        /* set click listeners for remove button and checkbox after creating listview. */
        var removeBtnSelectors = "#"+listViewId + " li a.ui-icon-delete";
        var checkBoxSelectors = "#"+listViewId + ' li a input[type="checkbox"]';

        shopping.updateListViewListeners(removeBtnSelectors , checkBoxSelectors);

        /* in case list of picked items is created and there are some items in local storage, make sure to mark all checkboxes*/
        if(("listOfPickedItems" === listKey) && (0 < shopping[listKey].length)){
            $("#"+listViewId+" :checkbox").prop('checked','true');
            $("#"+listViewId+" :checkbox").checkboxradio().checkboxradio("refresh");
        }

    },

    /* This method is used to set click listeners for every remove button as well as checkbox in the given listview.
       Note that the method 'on' is used which means that you must make sure to register these listeners only once otherwise
       handlers might be registered multiple times, hence such handlers might be executed multiple times per one click and cause
       unexpected behavior. */
    updateListViewListeners : function(selectorRemove, selectorCheckBox){
        $(selectorRemove).on("click", shopping.onRemoveItem);
        $(selectorCheckBox).on("click",shopping.onItemCompleted);
    },

    /* This method is invoked when the user clicks on add button in the footer. Actions steps are summarized as:
        1- Read new item that users enters through text field.
        2- Add new item to listview of items to buy.
        3- Add new item to list of items to buy.
        4- Update local storage with the new item.
        5- Finally, clear input field to indicate that user can enter extra items again. */
    onAddNewItem : function(event){
//        event.preventDefault();
        var newItem = shopping.getTxtInput();
        console.debug("inside onAddNewItem:", newItem);
        shopping.addItemToListView (shopping.listViewId      , newItem);
        shopping.addItemToList     (shopping.listOfGroceries , newItem);
        shopping.updateLocalStorage(shopping.localStorageKey, shopping.listOfGroceries);
        shopping.clearTxtField();
    },

    /* This method is invoked when the user clicks on remove button in given list view. Actions steps are summarized by:
        1- Remove selected item from corresponding list view.
        2- Remove selected item from corresponding list.
        3- Remove selected item from local storage.*/
    onRemoveItem : function(event){
        event.preventDefault();

        /* According to JQuery mobile structure, the parent node of remove button is list item that represents the entry of list
            view. This is the entry that would be removed.*/
        var $liObj = $(this).parent();

        /* Determine the listview from whcih the item would be removed. */
        var currentListViewId = $(this).parents('.ui-listview').attr('id');

        /* Get index for the item that would be removed, this would be the same index in either listview or list.
            This would handles the corner case if user enters same item more than once. */
        var index = $("#"+currentListViewId+" li").index($liObj);
        console.debug("index to be removed is: " + index);

        /* Determine which listview is pressed and accordingly which list that would be processed.*/
        var pairs = shopping.getListViewId_ListPairs(currentListViewId);

        /* Remove item from listview, list and local storage. */
        shopping.removeItemFromListView(pairs["listViewId"], index);
        shopping.removeItemFromList(pairs["list"], index);
        shopping.updateLocalStorage(pairs["key"], pairs["list"]);
    },

    onItemCompleted : function(event){
        event.preventDefault();

        var $checkboxObj = $(this);

        /* Determine the listview from whcih the item would be removed. */
        var currentListViewId = $(this).parents('.ui-listview').attr('id');

        /* Get index for the item that would be removed, this would be the same index in either listview or list.
            This would handles the corner case if user enters same item more than once. */
        var index = $('#' + currentListViewId + " :checkbox").index($checkboxObj);
        console.debug("index checked is: "+ index);

        /* Determine which listview is pressed and accordingly which list that would be processed.*/
        var pairs = shopping.getListViewId_ListPairs(currentListViewId);

        /* Upon clicking on checkbox remove it from current listview and add it to the other listview. */
        /* Remove item from listview and obtain its text value to be used in creating new list item tag that will be
            added to the other listview.*/
        var removedItemText = shopping.removeItemFromListView(pairs["listViewId"], index);
        shopping.removeItemFromList(pairs["list"], index);
        shopping.updateLocalStorage(pairs["key"], pairs["list"]);

        /* Note that this method (addItemToListView) is used when user clicks add button. This is useful for code reusability.*/
        shopping.addItemToListView( pairs["listViewId2"], removedItemText,pairs["style"]);
        shopping.addItemToList    ( pairs["list2"], removedItemText);
        shopping.updateLocalStorage(pairs["key2"], pairs["list2"]);
    },

    /* This method is used to set which group of list/listview/key that would be used upon swapping an item between the two list
        views*/
    getListViewId_ListPairs : function(currentListViewId){
        if( shopping.listViewId === currentListViewId ){
            return {"listViewId"  :shopping.listViewId ,
                    "list"        :shopping.listOfGroceries,
                    "key"         :shopping.localStorageKey,
                    "listViewId2" :shopping.pickedItemsListViewId ,
                    "list2"       :shopping.listOfPickedItems,
                    "key2"        :shopping.pickedItemsLocalStorageKey,
                    "style"       :"picked-item"
                   };
        }else{
            return {"listViewId"  :shopping.pickedItemsListViewId ,
                    "list"        :shopping.listOfPickedItems,
                    "key"         :shopping.pickedItemsLocalStorageKey,
                    "listViewId2" :shopping.listViewId ,
                    "list2"       :shopping.listOfGroceries,
                    "key2"        :shopping.localStorageKey,
                    "style"       :null
                   };
        }
    },

    getTxtInput : function(){
        return $("#item").val();
    },

    clearTxtField : function(){
        $("#item").val("");
    },

    addItemToListView : function(listViewId, newItem, itemStyleClass){
        var newItemLiTag = utilities.getLiHtmlTag(newItem,itemStyleClass);
        /* If you manipulate a listview via JavaScript (e.g. add new LI elements), you must call the refresh method on it to update the
            visual styling. But I found that the checkbox input misses some jquery-mobile classes so trigger listview creation event
            to load listview again and apply these missing classes.
            Another performant way is to refresh the checkbox and listview to update new items only instead of triggering creation
            event for the whole listview.
        */

        /* For some reason, when I programtically trigger the event of listview creation, it did not invoke onListViewCreate!!*/
//        $('#'+this.listViewId).append(newItemLiTag).listview("refresh").trigger("create");
        $('#'+listViewId).append(newItemLiTag).listview("refresh");
        $('#'+listViewId+' input[type="checkbox"]').checkboxradio().checkboxradio("refresh");

        /*Note that it is mandatory to select last child only otherwise click handler would be registered multiple times for the same
        button which leads to unexpected results.*/
        var removeBtnSelector = "#"+listViewId + " li:last a.ui-icon-delete";
        var checkBoxSelector = "#"+listViewId + ' li:last a input[type="checkbox"]';
        shopping.updateListViewListeners(removeBtnSelector, checkBoxSelector);

        if(itemStyleClass){
            $(checkBoxSelector).prop('checked','true');
            $(checkBoxSelector).checkboxradio().checkboxradio("refresh");
        }
    },

    removeItemFromListView : function(listViewId, index){

        var liDomObj = $("#"+listViewId + " li").get(index);
        var checkboxDomObj = $("#"+listViewId + " :checkbox").get(index);

        $(liDomObj).remove();

        /*refresh checkbox if list item is removed from list view due to clicking checkbox. */
        $(checkboxDomObj).checkboxradio().checkboxradio("refresh");

        /* refresh listview after removing any item. */
        $('#'+listViewId).listview("refresh");

        /* return text value of removed element. */
        return $(liDomObj).find("label").text();
    },

    addItemToList : function(list, newItem){
        /* Make sure that the item is not saved before */
        if(-1 === list.indexOf(newItem)){
            list.push(newItem);
        }else{
            console.warn("Display popup to the user about duplicate value");
            /*TODO: dispaly warning dialog/popup to the user about the duplicated value. */
        }
    },

    removeItemFromList : function(list,index){
        var NUM_OF_ELEMENTS = 1; // number of elements to be removed from array.
        list.splice(index, NUM_OF_ELEMENTS);
    },

    updateLocalStorage : function(key,list){
        localStorage.setItem(key, JSON.stringify(list));
    },

    getItemsFromLocalStorage : function(key){
        return JSON.parse(localStorage.getItem(key));
    }
};

shopping.initialize();
