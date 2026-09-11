-- 智绘强国 · 智慧教学平台 数据库结构 (阿里云 RDS MySQL)
-- 运行前请确认账号对目标库有读写权限

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS classes (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(32) PRIMARY KEY,
  class_id VARCHAR(32) NOT NULL,
  name VARCHAR(64) NOT NULL,
  avatar_color VARCHAR(16) DEFAULT '#22d3ee',
  KEY idx_class (class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(32) PRIMARY KEY,
  class_id VARCHAR(32) NOT NULL,
  title VARCHAR(128) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS preview_questions (
  id VARCHAR(32) PRIMARY KEY,
  session_id VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  options JSON NOT NULL,
  answer INT NOT NULL,
  score INT NOT NULL DEFAULT 25,
  ord INT DEFAULT 0,
  KEY idx_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS preview_answers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(32) NOT NULL,
  student_id VARCHAR(32) NOT NULL,
  question_id VARCHAR(32) NOT NULL,
  selected INT NOT NULL,
  correct TINYINT(1) NOT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_pa (student_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS homeworks (
  id VARCHAR(32) PRIMARY KEY,
  session_id VARCHAR(32) NOT NULL,
  title VARCHAR(128) NOT NULL,
  description TEXT,
  deadline VARCHAR(32),
  dav_path VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS homework_submissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  homework_id VARCHAR(32) NOT NULL,
  student_id VARCHAR(32) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  size BIGINT NOT NULL DEFAULT 0,
  dav_url VARCHAR(512),
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_hw_sub (homework_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS exercises (
  id VARCHAR(32) PRIMARY KEY,
  session_id VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  options JSON NOT NULL,
  answer INT NOT NULL,
  ord INT DEFAULT 0,
  KEY idx_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS exercise_answers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  exercise_id VARCHAR(32) NOT NULL,
  student_id VARCHAR(32) NOT NULL,
  selected INT NOT NULL,
  correct TINYINT(1) NOT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_exa (exercise_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
