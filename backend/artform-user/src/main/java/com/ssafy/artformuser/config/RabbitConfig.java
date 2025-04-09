package com.ssafy.artformuser.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableRabbit
public class RabbitConfig {

    @Bean
    MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // RabbitTemplate 설정
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        rabbitTemplate.setConfirmCallback((correlationData, ack, cause) -> {
            if (!ack) {
                System.err.println("메시지 전송 실패: " + cause);
            }
        });
        return rabbitTemplate;
    }

    // Dead Letter 설정
    // 메시지가 소비되지 못하면 다른곳으로 이동
    @Bean
    public Queue likeQueue() {
        return QueueBuilder.durable("likes.queue") // 큐가 제거되는것을 막음 ( 지속성 설정 )
                .withArgument("x-dead-letter-exchange", "likes.dlx") // 메시지 거부 시 dlx로 메시지 보냄
                .withArgument("x-dead-letter-routing-key", "likes.dlq") // "likes.dlq" 라는 라우팅 키로 새로운 큐로 전달
                .build();
    }

    // 좋아요 메시지 교환기
    @Bean
    public TopicExchange likeExchange() {
        return new TopicExchange("like-exchange");
    }

    // 좋아요 큐와 교환기 바인딩
    @Bean
    public Binding likeBinding(Queue likeQueue, TopicExchange likeExchange) {
        return BindingBuilder
                .bind(likeQueue)
                .to(likeExchange)
                .with("like.#");
    }

    // Dead Letter 큐
    @Bean
    public Queue deadLetterQueue() {
        return new Queue("likes.dlq", true);
    }

    // Dead Letter 교환기
    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange("likes.dlx");
    }

    // Dead Letter 바인딩
    @Bean
    public Binding deadLetterBinding(Queue deadLetterQueue, DirectExchange deadLetterExchange) {
        return BindingBuilder
                .bind(deadLetterQueue)
                .to(deadLetterExchange)
                .with("likes.dlq");
    }
}
