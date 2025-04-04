package com.d103.artformcore.repository;

import com.d103.artformcore.entity.Model;
import com.d103.artformcore.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findReviewByModelOrderByCreatedAtDesc(Model model);
}
