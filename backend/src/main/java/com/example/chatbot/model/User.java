package com.example.chatbot.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "tbl_chatbot_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "u_id")
    private Long id;

    @Column(name = "u_login_id", nullable = false, unique = true)
    private String loginId;

    @Column(name = "u_login_pwd", nullable = false)
    private String loginPwd;

    @Column(name = "u_name", nullable = false)
    private String name;

    @Column(name = "u_birthday")
    private LocalDate birthday;

    @Column(name = "u_gender")
    private String gender;

    @Column(name = "u_region")
    private String region;

    @Column(name = "u_industry")
    private String industry;
}