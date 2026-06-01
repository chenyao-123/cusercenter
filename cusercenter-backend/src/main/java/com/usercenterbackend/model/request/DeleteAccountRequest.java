package com.usercenterbackend.model.request;

import java.io.Serializable;

public class DeleteAccountRequest implements Serializable {
    private static final long serialVersionUID = 3191241716373120793L;
    
    private Long id;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
