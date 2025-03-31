package com.ssafy.artformuser.config;

import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableRabbit
public class RabbitConfig {
    
    // 메시지를 큐로 전달하는 엔티티
    @Value("${rabbitmq.exchange.name}")
    private String exchangeName;

    // 큐의 이름(예: 좋아요 이벤트 큐)
    @Value("${rabbitmq.queue.like-events}")
    private String likeEventsQueueName;

    // Dead Letter Queue의 이름(메시지가 처리되지 않으면 이곳으로 이동)
    @Value("${rabbitmq.queue.dead-letter}")
    private String deadLetterQueueName;
}
