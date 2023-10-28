const {
		QMainWindow,
		QWidget,
		QLabel,
		QLineEdit,
		QPushButton,
		FlexLayout
} = require("@nodegui/nodegui");

const win = new QMainWindow();

const centralWidget = new QWidget();
centralWidget.setObjectName("root");
const rootLayout = new FlexLayout();
centralWidget.setLayout(rootLayout);

const label = new QLabel();
label.setObjectName("label");
label.setText("Login");

const instanceField = new QLineEdit();
instanceField.setObjectName("instance");
instanceField.setPlaceholderText("Instance URL");

const userField = new QLineEdit();
userField.setObjectName("user");
userField.setPlaceholderText("Username");

const passField = new QLineEdit();
passField.setObjectName("pass");
passField.setPlaceholderText("Password");

const loginButton = new QPushButton();
loginButton.setObjectName("login");
loginButton.setText("Login");

rootLayout.addWidget(label);
rootLayout.addWidget(instanceField);
rootLayout.addWidget(userField);
rootLayout.addWidget(passField);
rootLayout.addWidget(loginButton);
win.setCentralWidget(centralWidget);
win.show();

global.win = win;
