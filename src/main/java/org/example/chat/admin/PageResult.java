package org.example.chat.admin;

import org.example.chat.model.User;

import java.util.List;
import java.util.Map;

public class PageResult {
    private int total; // 总记录数
    private List<User> list; // 当前页数据列表
    private Map<String, String> avatarData; // 用户头像数据，key为用户账号，value为Base64编码的头像数据
    
    public PageResult(int total, List<User> list) {
        this.total = total;
        this.list = list;
    }
    
    public PageResult(int total, List<User> list, Map<String, String> avatarData) {
        this.total = total;
        this.list = list;
        this.avatarData = avatarData;
    }
    
    public int getTotal() {
        return total;
    }
    
    public void setTotal(int total) {
        this.total = total;
    }
    
    public List<User> getList() {
        return list;
    }
    
    public void setList(List<User> list) {
        this.list = list;
    }
    
    public Map<String, String> getAvatarData() {
        return avatarData;
    }
    
    public void setAvatarData(Map<String, String> avatarData) {
        this.avatarData = avatarData;
    }
}
