
CREATE TABLE IF NOT EXISTS problems
(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty INT NOT NULL,
    tags TEXT[] NOT NULL,
    codeTemplates TEXT NOT NULL,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS Competitions
(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    startTime TIMESTAMPTZ NOT NULL,
    endTime TIMESTAMPTZ NOT NULL,
    problems uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ProblemResults
(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    problemId uuid REFERENCES problems(id) ON DELETE CASCADE,
    competitionId uuid REFERENCES Competitions(id) ON DELETE CASCADE,
    userId uuid NOT NULL,
    status INT NOT NULL DEFAULT 0, -- 0: Submitted, 1: Accepted, 2: Wrong Answer, 3: Runtime Error, etc.
    timeTaken float NOT NULL DEFAULT 0.0,
    memoryUsed float NOT NULL DEFAULT 0.0,
    submittedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS Users
(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO Problems (id, name, description, difficulty, tags, codeTemplates) VALUES
(
    'b4b852cf-8781-4ab2-a00f-5fb52c39c478',
    'Two Sum', 
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', 
    1, 
    ARRAY['Array', 'Hash Table'], '{"python": "def twoSum(nums, target):\\n    pass", "java": "public int[] twoSum(int[] nums, int target) {\\n    // TODO: Implement\\n}"}'
),
(
    '46fe4f2f-9230-46f1-999d-43cbba9d745f',
    'Add Two Numbers',
    'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.', 
    2, 
    ARRAY['Linked List', 'Math'], '{"python": "def addTwoNumbers(l1, l2):\\n    pass", "java": "public ListNode addTwoNumbers(ListNode l1, ListNode l2) {\\n    // TODO: Implement\\n}"}'
),
(
    '6523ab11-ff23-4389-a43e-d1c459d8804b',
    'Longest Substring Without Repeating Characters',
    'Given a string s, find the length of the longest substring without repeating characters.',
    3,
    ARRAY['String', 'Sliding Window'],
    '{"python": "def lengthOfLongestSubstring(s):\\n    pass", "java": "public int lengthOfLongestSubstring(String s) {\\n    // TODO: Implement\\n}"}'
),
(
    'd6767ef6-aecc-489b-8834-469e7807f8f1',
    'Median of Two Sorted Arrays',
    'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
    4,
    ARRAY['Array', 'Binary Search'],
    '{"python": "def findMedianSortedArrays(nums1, nums2):\\n    pass", "java": "public double findMedianSortedArrays(int[] nums1, int[] nums2) {\\n    // TODO: Implement\\n}"}'
),
(
    '0f32aed9-2415-4578-b954-b3d9f3ee5a6c',
    'Longest Palindromic Substring',
    'Given a string s, return the longest palindromic substring in s.',
    3,
    ARRAY['String', 'Dynamic Programming'],
    '{"python": "def longestPalindrome(s):\\n    pass", "java": "public String longestPalindrome(String s) {\\n    // TODO: Implement\\n}"}'
),
(
    'b92e82c2-3399-47ab-9fe6-4d626a0d4567',
    'ZigZag Conversion',
    'The string "PAYPALISHIRING" is written in a zigzag pattern on a given number of rows like this: (you may want to display this pattern in a fixed font for better legibility) And then read line by line: "PAHNAPLSIIGYIR"',
    2,
    ARRAY['String'],
    '{"python": "def convert(s, numRows):\\n    pass", "java": "public String convert(String s, int numRows) {\\n    // TODO: Implement\\n}"}'
),
(
    'a3060a4f-fd23-4f1f-b040-66f50884a307',
    'Container With Most Water',
    'You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.',
    2,
    ARRAY['Array', 'Two Pointers'],
    '{"python": "def maxArea(height):\\n    pass", "java": "public int maxArea(int[] height) {\\n    // TODO: Implement\\n}"}'
),
(
    'fd8f57cc-2f76-41e5-a0ed-d3df1977e01e',
    'Integer to Roman',
    'Given an integer, convert it to a roman numeral.',
    2,
    ARRAY['Math', 'String'],
    '{"python": "def intToRoman(num):\\n    pass", "java": "public String intToRoman(int num) {\\n    // TODO: Implement\\n}"}'
),
(
    '42764af1-7eb7-4f0c-9584-86c752e10a48',
    'Roman to Integer',
    'Given a roman numeral, convert it to an integer.',
    2,
    ARRAY['Math', 'String'],
    '{"python": "def romanToInt(s):\\n    pass", "java": "public int romanToInt(String s) {\\n    // TODO: Implement\\n}"}'
),
(
    '437d52ff-69fa-4989-954d-f8454afc6b74',
    'Longest Common Prefix',
    'Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string "".',
    1,
    ARRAY['String'],
    '{"python": "def longestCommonPrefix(strs):\\n    pass", "java": "public String longestCommonPrefix(String[] strs) {\\n    // TODO: Implement\\n}"}'
);

INSERT INTO Competitions (id, name, problems, startTime, endTime) VALUES
(
    'd1f5e8c3-3b6e-4f2a-9f4e-2b5c6d7e8f90',
    'Docker Coding Challenge',
    ARRAY[
        'b4b852cf-8781-4ab2-a00f-5fb52c39c478'::uuid,
        '46fe4f2f-9230-46f1-999d-43cbba9d745f'::uuid,
        '6523ab11-ff23-4389-a43e-d1c459d8804b'::uuid,
        'd6767ef6-aecc-489b-8834-469e7807f8f1'::uuid,
        '0f32aed9-2415-4578-b954-b3d9f3ee5a6c'::uuid,
        'b92e82c2-3399-47ab-9fe6-4d626a0d4567'::uuid,
        'a3060a4f-fd23-4f1f-b040-66f50884a307'::uuid,
        'fd8f57cc-2f76-41e5-a0ed-d3df1977e01e'::uuid,
        '42764af1-7eb7-4f0c-9584-86c752e10a48'::uuid,
        '437d52ff-69fa-4989-954d-f8454afc6b74'::uuid
    ],
    NOW(),
    NOW() + INTERVAL '7 days'
);

SELECT problems.* FROM problems join competitions ON competitions.problems @> ARRAY[problems.id]
WHERE competitions.id = 'd1f5e8c3-3b6e-4f2a-9f4e-2b5c6d7e8f90';

    -- problemId uuid REFERENCES problems(id) ON DELETE CASCADE,
    -- competitionId uuid REFERENCES Competitions(id) ON DELETE CASCADE,
    -- userId uuid NOT NULL,

CREATE OR REPLACE FUNCTION SubmitAnswerToCompetitionProblem(
    pcompetitionid UUID,
    pproblemid UUID,
    puserid UUID,
    pstatus INT,
    OUT pusername VARCHAR(255),
    OUT score INT
)
LANGUAGE plpgsql
AS $$
DECLARE
BEGIN

    SELECT username INTO pusername FROM Users
    WHERE id = puserid;

MERGE INTO ProblemResults AS pr
USING (SELECT pcompetitionid AS competitionId, pproblemid AS problemId, puserid AS userId) 
    AS src
ON pr.userId = src.userid 
    AND pr.problemId = src.problemid 
    AND pr.competitionId = src.competitionid
WHEN MATCHED THEN
    UPDATE SET submittedAt = NOW(),
    updatedAt = NOW(),
    status = pstatus
WHEN NOT MATCHED THEN
    INSERT (problemId, competitionId, userId, status) 
    VALUES (pproblemid, pcompetitionid, puserid, pstatus);

    SELECT COUNT(*) INTO score FROM ProblemResults
    WHERE competitionId = pcompetitionid
        AND userId = puserid
        AND status = 1;

END;
$$;

