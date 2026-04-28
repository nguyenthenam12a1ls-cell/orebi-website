# Day 1 Backend Flow

- `index.js` khoi tao server, gan middleware va routes.
- `routes` dinh nghia endpoint nao goi controller nao.
- `middleware` xu ly truoc controller, vi du xac thuc token.
- `controller` chua logic nghiep vu.
- `model` thao tac voi du lieu/database.

## Flows da hoc

- Login: `route -> controller -> model -> response`
- Profile: `route -> middleware -> controller -> model -> response`

## Dieu da hieu

- Login khong can `userAuth` vi user chua co token.
- Profile can `userAuth` de xac thuc token truoc khi vao controller.
- Backend tra response JSON, frontend moi quyet dinh hien thi giao dien.
