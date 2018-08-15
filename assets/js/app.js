'use strict';
$(function(){
    APP.initialize();
});

var APP = {

    // TODO: あとで整理する
    store: {
        TOP_PAGE: 1,
        REGISTRATION_PAGE: 2,
        SEARCH_PAGE: 3,
        OUTPUT_XLSX: 1,
        OUTPUT_CSV: 2,
        currentPageId: 1,
        isOutput: false,
    },

    initialize() {
        console.log('APP START');
        var self = this;
        self.eventLoader();
    },

    fetchUserData(e) {
        var self = e.data.self;

        //
        // ローカル用に書き換えて見てね
        //
        // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
        COMMON.ajax('【APIへのURL】', 'GET', null, self._didFetchUserData);
    },

    _didFetchUserData(state) {
        var $target = $('.user-data-area'),
            result  = '',
            i       = 0;
        console.dir(state);

        $target.empty();

        if (state.userData === null) {
            alert('データがありません');
            return;
        }

        result = '<table class="table table-striped">' + 
                    '<thead>' + 
                        '<tr>' + 
                            '<th>ID</th>' + 
                            '<th>名前</th>' + 
                            '<th>職業</th>' + 
                            '<th>備考</th>' + 
                            '<th>操作</th>' + 
                        '</tr>' + 
                    '</thead>' + 
                    '<tbody>';
                        
        
        for (; i < state.userData.length; i++) {
            result += '<tr>' + 
                        '<td>'+ state.userData[i].id +'</td>' + 
                        '<td>'+ state.userData[i].name +'</td>' + 
                        '<td>'+ state.userData[i].job +'</td>' + 
                        '<td>'+ state.userData[i].biko +'</td>' + 
                        '<td><button data-primary-key="'+ state.userData[i].id +'" type="button" class="btn btn-danger btn-xs js-delete-data">削除</button></td>' + 
                      '</tr>';
        }
        result +=  '</tbody>' + 
                 '</table>';
        
        
        $target.append(result);
    },

    serachUserData(e) {
        var self = e.data.self,
            $nameValue = $('#SearchPage__name').val(),
            $jobValue  = $('#SearchPage__job').val(),
            $bikoValue = $('#SearchPage__biko').val();

        //
        // ローカル用に書き換えて見てね
        //
        // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
        COMMON.ajax('【APIへのURL】?name=' + $nameValue + '&job=' + $jobValue + '&biko=' + $bikoValue, 'GET', null, self._didSerachUserData);
    },

    _didSerachUserData(state, status) {
        var $target = $('.serach-display-area'),
            result  = '',
            i       = 0;
        console.dir(state);

        if (!status) {
            alert('検索に失敗しました。。。');
            return;
        }

        $target.empty();

        if (state.userData === null) {
            alert('検索結果は、0件です');
            $('.js-output-xlsx-data').prop('disabled', true);
            $('.js-output-csv-data').prop('disabled', true);
            APP.store.isOutput = false;
            return;
        }

        result = '<table class="table table-striped">' + 
                    '<thead>' + 
                        '<tr>' + 
                            '<th>ID</th>' + 
                            '<th>名前</th>' + 
                            '<th>職業</th>' + 
                            '<th>備考</th>' + 
                        '</tr>' + 
                    '</thead>' + 
                    '<tbody>';
                        
        
        for (; i < state.userData.length; i++) {
            result += '<tr>' + 
                        '<td>'+ state.userData[i].id +'</td>' + 
                        '<td>'+ state.userData[i].name +'</td>' + 
                        '<td>'+ state.userData[i].job +'</td>' + 
                        '<td>'+ state.userData[i].biko +'</td>' + 
                      '</tr>';
        }
        result +=  '</tbody>' + 
                 '</table>';
        
        
        $target.append(result);

        if (!APP.store.isOutput) {
            $('.js-output-xlsx-data').prop('disabled', false);
            $('.js-output-csv-data').prop('disabled', false);
            APP.store.isOutput = true;
        }
    },
    
    commitUserData(e) {
        var self = e.data.self,
            $nameValue = $('#name').val(),
            $jobValue  = $('#job').val(),
            $bikoValue = $('#biko').val();
           
        if ($nameValue === '' || $jobValue === '') {
            alert('必須項目いれてくれ');
            return;
        } 

        //
        // ローカル用に書き換えて見てね
        //
        // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
        COMMON.ajax('【APIへのURL】', 'POST', {
            name: $nameValue,
            job: $jobValue,
            biko: $bikoValue,
        }, self._didCommitUserData);
    },

    _didCommitUserData(state, status) {

        if (status) {
            console.log(state);
            alert('データを登録しました');
        } else {
            console.log(state);
            alert('データの登録に失敗しました');
        }
    },

    transitionPage(e){
        var self   = e.data.self,
            pageId = Number(e.currentTarget.dataset.id),
            $targetLi = e.currentTarget;

        // 同じページの場合、何もしない
        if (pageId === self.store.currentPageId) return;

        switch (pageId) {
            case self.store.TOP_PAGE:
                $('.Top').show();
                $('.RegistrationPage').hide();
                $('.SearchPage').hide();
                
                break;

            case self.store.REGISTRATION_PAGE:
                $('.Top').hide();
                $('.RegistrationPage').show();
                $('.SearchPage').hide();

                break;

            case self.store.SEARCH_PAGE:
                $('.Top').hide();
                $('.RegistrationPage').hide();
                $('.SearchPage').show();
                break;

            default: 
                console.log('＾q＾');
        }

        // active削除
        $('[data-id='+self.store.currentPageId+']').removeClass('active');

        // active付与
        $targetLi.classList.add('active');

        // pageの状態を切り替える
        self.store.currentPageId = pageId;
    },

    deleteUserData(e) {
        var self       = e.data.self,
            primaryKey = Number(e.target.dataset.primaryKey);

        //
        // ローカル用に書き換えて見てね
        //
        // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
        COMMON.ajax('【APIへのURL】', 'DELETE',{
            id: primaryKey
        }, self._didDeleteUserData);
    },

    _didDeleteUserData(state, status){
        if (status) {
            alert('削除に成功しました');
            COMMON.ajax('【APIへのURL】', 'GET', null, APP._didFetchUserData);
        } else {
            alert('削除に失敗しました');
        }
    },

    outputFile(e) {
        var self = e.data.self,
            type = e.data.type,            
            $nameValue = $('#SearchPage__name').val(),
            $jobValue  = $('#SearchPage__job').val(),
            $bikoValue = $('#SearchPage__biko').val(),

        //
        // ローカル用に書き換えて見てね
        //
        // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
        xlsxUrl    = '【APIへのURL】?name=' + $nameValue + '&job=' + $jobValue + '&biko=' + $bikoValue,

        //
        // ローカル用に書き換えて見てね
        //
        // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
        csvUrl     = '【APIへのURL】?name=' + $nameValue + '&job=' + $jobValue + '&biko=' + $bikoValue;

        switch(type) {
            case self.store.OUTPUT_XLSX:
                location.href = xlsxUrl;
                break;
            case self.store.OUTPUT_CSV:
                location.href = csvUrl;
                break;
        }
    },

    eventLoader() {
        console.log('Event Loading');
        var self = this;

        // データ全件取得
        $('.js-fetch-data').on('click', {self: self}, self.fetchUserData);

        // データ条件取得
        $('.js-serach-data').on('click', {self: self}, self.serachUserData);

        // データ登録
        $('.js-registration-data').on('click', {self: self}, self.commitUserData);

        // ページ遷移制御
        $('.js-transition-page').on('click', {self: self}, self.transitionPage);

        // データ削除
        $(document).on('click', '.js-delete-data', {self: self}, self.deleteUserData);

        // エクセル出力
        $('.js-output-xlsx-data').on('click', {
            self: self,
            type: self.store.OUTPUT_XLSX,
        }, self.outputFile);

        // CSV出力
        $('.js-output-csv-data').on('click', {
            self: self,
            type: self.store.OUTPUT_CSV,
        }, self.outputFile);
    },
};

var COMMON = {
    ajax(url, method, parameter, callback) {
        $.ajax({
            type        : method,
            url         : url,
            contentType : 'application/json',
            data        : parameter !== null ? JSON.stringify(parameter) : '',
            dataType    : 'JSON',
        }).done(function(state){
            callback(state, true);
    
        }).fail(function(XMLHttpRequest, textStatus, errorThrown){
            var state = {
                XMLHttpRequest : XMLHttpRequest,
                textStatus     : textStatus,
                errorThrown    : errorThrown,
            };
            callback(state, false);
        });
    },

}
