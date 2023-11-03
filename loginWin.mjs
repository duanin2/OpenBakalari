import qt from "@nodegui/nodegui";
import { OrderedLayout } from "./qt.mjs";

const loginLayout = new OrderedLayout(new qt.FlexLayout());

const loginWin = new qt.QWidget();
loginWin.setObjectName("root");
loginWin.setInlineStyle("margin: auto; padding: 4px;");
loginWin.setMinimumSize(200, 150);
loginWin.setLayout(loginLayout.value);

loginLayout.add("label", new qt.QLabel());
loginLayout.add("errorMessage", new qt.QLabel());
loginLayout.add("userSelector", new qt.QComboBox());
loginLayout.add("instance", new qt.QLineEdit());
loginLayout.add("username", new qt.QLineEdit());
loginLayout.add("loginType", new qt.QComboBox());
loginLayout.add("password", new qt.QLineEdit());
loginLayout.add("login", new qt.QPushButton());
loginLayout.add("cancel", new qt.QPushButton());

loginLayout.getValueOf("label").setInlineStyle("font-size: 16px;");
loginLayout.getValueOf("label").setText("Login");

loginLayout.getValueOf("errorMessage").setInlineStyle("color: red;");
loginLayout.getValueOf("errorMessage").setDisabled(true);

loginLayout.getValueOf("userSelector").addItem(undefined, "None");

loginLayout.getValueOf("instance").setPlaceholderText("Instance URL");

loginLayout.getValueOf("username").setPlaceholderText("Username");

loginLayout.getValueOf("password").setPlaceholderText("Password");

loginLayout.getValueOf("loginType").addItem(undefined, "Password");
loginLayout.getValueOf("loginType").addItem(undefined, "Refresh Token");

loginLayout.getValueOf("login").setInlineStyle("width: 50%;");
loginLayout.getValueOf("login").setText("Login");

loginLayout.getValueOf("cancel").setInlineStyle("width: 50%;");
loginLayout.getValueOf("cancel").setText("Cancel");

export { loginWin, loginLayout };
