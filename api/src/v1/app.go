package main
import (
    "fmt"
    "net/http"
    "encoding/json"
    "encoding/csv"
    "time"
    "os"
    "io/ioutil"
    "strconv"
    "database/sql"

    _ "github.com/go-sql-driver/mysql"
    "github.com/tealeg/xlsx"
    iconv "github.com/djimenez/iconv-go"
)

type ResOk struct {
    Ok string `json:"ok"`
}

type ResUserData struct {
    UserData Users `json:"userData"`
}

type Users []User

type User struct {
    Id int `json:"id"`
	Name string `json:"name"`
    Job string `json:"job"`
    Biko string `json:"biko"`
}

var layout = "2006-01-02 15:04:05"

// ルートパス
func IndexHandler(w http.ResponseWriter,
  r *http.Request) {

  fmt.Fprint(w, "hello world")
}

// ユーザデータを検索して返却する
func GetUserData(queryMap map[string][]string) (resUserData ResUserData) {

    //
    // ローカル用に書き換えて見てね
    //
    // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    db, err := sql.Open("mysql", "【ここにユーザ名】:【ここにパスワード】@/【ここにDB名】")
    if err != nil {
        panic(err)
    }
    defer db.Close()

    var user User
    query := "SELECT * FROM mst_users"

    if len(queryMap) != 0 {
        user = User{
            Name: queryMap["name"][0],
            Job : queryMap["job"][0],
            Biko: queryMap["biko"][0],
        }
        
        query += " WHERE 1 = 1"
        if user.Name != "" {
            query += " AND name LIKE '%" + user.Name + "%'"
        }

        if user.Job != "" {
            query += " AND job LIKE '%" + user.Job + "%'"
        }

        if user.Biko != "" {
            query += " AND biko LIKE '%" + user.Biko + "%'"
        }
    }

    fmt.Println(query)
    rows, err := db.Query(query)
    if err != nil {
        panic(err.Error())
    }
    defer rows.Close()

    var users Users

    for rows.Next() {
        var _id int
        var _name string
        var _job string
        var _biko string
        if err := rows.Scan(&_id, &_name, &_job, &_biko); err != nil {
            panic(err.Error())
        }
        user := User {
            Id: _id,
            Name: _name,
            Job: _job,
            Biko: _biko,
        }

        // Goのsliceの動きメモ
        // https://qiita.com/koher/items/3c570dfdd3ee25cd8017
        // http://jxck.hatenablog.com/entry/golang-slice-internals2
        users = append(users, user)
    }

    resUserData = ResUserData{
        UserData: users,
    }

    return
}

// ユーザ情報をハンドリングする
func UserHandler(w http.ResponseWriter, r *http.Request) {

    if r.Method == "GET" { // ユーザデータ全件取得

        resUserData := GetUserData(r.URL.Query())

		res, err := json.Marshal(resUserData)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
        }
        
        w.Header().Set("Content-Type", "application/json")

        //
        // CORSのリクエストは2種類
        // 1. そのままAPIへリクエスト
        // 2. 先にpreflightリクエストを送ってから、その後でAPIへリクエスト
        //
        // preflightリクエストを送るかどうかはブラウザが決めており、
        // 以下の条件全てに 【当てはまらない】 リクエストの場合は 【自動】 で送られる
        // 
        // 1. HTTPメソッドがGET, POST, HEADのいずれか
        // 2. HTTPヘッダにAccept, Accept-Language, Content-Language, Content-Type以外のフィールドが含まれない
        // 3. Content-Typeの値はapplication/x-www-form-urlencoded, multipart/form-data, text/plainのいずれか
        //
        
        // CORS対策
        w.Header().Set("Access-Control-Allow-Origin", "*")
        
        // プリフライト対策
        // w.Header().Set("Access-Control-Allow-Headers","Content-Type")

        // もしも、JS からリクエストするときに、カスタムヘッダーなども追加している場合は、
        // 例えば、X-Hogeというカスタムヘッダーだとすると、以下のようにそれも追記しておく必要がある。
        // w.Header().Set("Access-Control-Allow-Headers","Content-Type, X-Hoge")

		w.Write(res)
		
    } else if r.Method == "POST" { // ユーザデータ登録

        defer r.Body.Close()

        decoder := json.NewDecoder(r.Body)
        var user User
        err := decoder.Decode(&user)
        if err != nil {
            panic(err)
        }

        
        //
        // ローカル用に書き換えて見てね
        //
        // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
        db, err := sql.Open("mysql", "【ここにユーザ名】:【ここにパスワード】@/【ここにDB名】")
        if err != nil {
            panic(err)
        }
        defer db.Close()

        _, err = db.Exec(
            "INSERT INTO mst_users (name, job, biko) VALUES (?, ?, ?)", 
            user.Name, 
            user.Job, 
            user.Biko,
        )
        if err != nil {
            panic(err)
        }

        // JSONでレスポンスを返却する
        res, _ := json.Marshal(ResOk{
            "OK",
        })

        w.Header().Set("Content-Type", "application/json")
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Write(res)

    } else if r.Method == "DELETE" { // ユーザデータ削除

        defer r.Body.Close()

        decoder := json.NewDecoder(r.Body)
        var user User
        err := decoder.Decode(&user)
        if err != nil {
            panic(err)
        }
        

        //
        // ローカル用に書き換えて見てね
        //
        // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
        db, err := sql.Open("mysql", "【ここにユーザ名】:【ここにパスワード】@/【ここにDB名】")
        if err != nil {
            panic(err)
        }
        defer db.Close()

        _, err = db.Exec("DELETE FROM mst_users WHERE id = ?", user.Id)
        if err != nil {
            panic(err)
        }

        res, _ := json.Marshal(ResOk{
            "OK",
        })

        w.Header().Set("Content-Type", "application/json")
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Write(res)
    }
}

func OutputXlsxHandler(w http.ResponseWriter, r *http.Request) {

    var file *xlsx.File
    var sheet *xlsx.Sheet
    var row *xlsx.Row
    var cell *xlsx.Cell
    var err error

    resUserData := GetUserData(r.URL.Query())

    file = xlsx.NewFile()
    sheet, err = file.AddSheet("ユーザ一覧")
    if err != nil {
        fmt.Printf(err.Error())
    }
    row = sheet.AddRow()
    cell = row.AddCell()
    cell.Value = "id"
    cell = row.AddCell()
    cell.Value = "名前"
    cell = row.AddCell()
    cell.Value = "職業"
    cell = row.AddCell()
    cell.Value = "備考"

    for _, v := range resUserData.UserData {
        row = sheet.AddRow()
        cell = row.AddCell()

        cell.Value = strconv.Itoa(v.Id)
        cell = row.AddCell()
        cell.Value = v.Name
        cell = row.AddCell()
        cell.Value = v.Job
        cell = row.AddCell()
        cell.Value = v.Biko
    }

    filePath := "/tmp/test.xlsx"
    err = file.Save(filePath)
    if err != nil {
        fmt.Printf(err.Error())
    }

    dt := time.Now()
    str := dt.Format(layout)

    attachment := "attachment; filename=" + "ユーザ一覧_" + str + ".xlsx"

    w.Header().Set("Content-Type", "application/vnd.ms-excel")
    w.Header().Set("Content-Disposition", attachment)
    w.Header().Set("Cache-Control", "max-age=0")
    w.WriteHeader(http.StatusOK)

    content, err := ioutil.ReadFile("/tmp/test.xlsx")
    if err != nil {
        panic(err)
    }

    w.Write(content)
}


func OutputCsvHandler(w http.ResponseWriter, r *http.Request) {

    resUserData := GetUserData(r.URL.Query())

    // O_WRONLY: 書き込みモード開く, O_CREATE: 存在しない場合、ファイルを作成
    // file, err := os.OpenFile("/tmp/test.csv", os.O_WRONLY|os.O_CREATE, 0600)
    file, err := os.Create("/tmp/test.csv")
    if err != nil {
        panic(err)
    }
    defer file.Close()

    converter, err := iconv.NewWriter(file, "utf-8", "sjis")

    writer := csv.NewWriter(converter)
    writer.Write([]string{"id", "名前", "職業", "備考",})

    for _, v := range resUserData.UserData {

        writer.Write([]string{
            strconv.Itoa(v.Id),
            v.Name,
            v.Job,
            v.Biko,
        })
    }

    writer.Flush()

    dt := time.Now()
    str := dt.Format(layout)

    attachment := "attachment; filename=" + "ユーザ一覧_" + str + ".csv"

    w.Header().Set("Content-Disposition", attachment)
    w.Header().Set("Content-Type", "text/csv")
    content, err := ioutil.ReadFile("/tmp/test.csv")
    if err != nil {
        panic(err)
    }

    w.Write(content)
}

func main() {

    //
    // ルーティングの設定
    //

    http.HandleFunc("/", IndexHandler)
    http.HandleFunc("/api/v1/user", UserHandler)
    http.HandleFunc("/api/v1/output/xlsx", OutputXlsxHandler)
    http.HandleFunc("/api/v1/output/csv", OutputCsvHandler)

    // http.ListenAndServe()にポートを指定してサーバを起動している
    // 第二引数は今回使わないので、nilを指定
    http.ListenAndServe(":5000", nil)
}