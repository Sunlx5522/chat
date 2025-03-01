package org.example.chat.repository;  // 指定该接口所属的包名，组织代码结构，便于管理和查找。

import org.example.chat.model.Request;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;  // 导入Spring Data JPA提供的JpaRepository接口，包含了基本的CRUD操作方法。

public interface RequestRepository extends JpaRepository<Request, String> {  // 定义一个名为UserRepository的接口，继承自JpaRepository，泛型参数<User, String>指定了实体类型为User，主键类型为String。

    @Query("SELECT f FROM Request f WHERE f.receiver_account = :receiver_account")
    List<Request> findByReceiver_account(@Param("receiver_account") String receiver_account);

    @Query("SELECT r FROM Request r WHERE r.sender_account = :senderAccount AND r.receiver_account = :receiverAccount")
    Request findBySenderAndReceiver(@Param("senderAccount") String senderAccount,
                                    @Param("receiverAccount") String receiverAccount);
    @Modifying
    @Transactional
    @Query("DELETE FROM Request r WHERE r.sender_account = :senderAccount AND r.receiver_account = :receiverAccount")
    void deleteBySenderAndReceiver(@Param("senderAccount") String senderAccount,
                                   @Param("receiverAccount") String receiverAccount);
}