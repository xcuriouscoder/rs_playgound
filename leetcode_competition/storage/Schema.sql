
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
);

INSERT INTO Competitions (id, name, problems, startTime, endTime) VALUES
(
    'd1f5e8c3-3b6e-4f2a-9f4e-2b5c6d7e8f90',
    'Docker Coding Challenge',
    ARRAY[
        'b4b852cf-8781-4ab2-a00f-5fb52c39c478'::uuid,
        '46fe4f2f-9230-46f1-999d-43cbba9d745f'::uuid
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
    pstatus INT
) RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    score INT;
BEGIN

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

    RETURN score;
END;
$$;

-- create or replace PROCEDURE UpdatePassengerCount(
--     puserid UUID,
--     prideid UUID,
--     passenger_count INT
-- )
-- LANGUAGE plpgsql
-- AS $$
-- DECLARE
--     pass_count INT;
-- BEGIN
--     UPDATE rides
--     SET passengers = passenger_count,
--         updatedAt = NOW()
--     WHERE id = prideid
--         AND userid = puserid 
--         AND rideStatus = 0
--     RETURNING passengers INTO pass_count;

--     IF pass_count IS NULL OR pass_count != passenger_count THEN
--         RAISE EXCEPTION 'Ride cannot be updated. Either it does not exist or is not in a state that can be updated.';
--     END IF;
-- END;
-- $$;


-- create or replace PROCEDURE ActivateRide(
--     puserid UUID,
--     prideid UUID
-- )
-- LANGUAGE plpgsql
-- AS $$
-- DECLARE
--     ride_status INT;

-- BEGIN
--     UPDATE rides
--     SET rideStatus = 1,
--         updatedAt = NOW()
--     WHERE id = prideid
--         AND userid = puserid 
--         AND rideStatus = 0
--     RETURNING rideStatus INTO ride_status;

--     IF ride_status IS NULL OR ride_status != 1 THEN
--         RAISE EXCEPTION 'Ride cannot be activated. Either it does not exist or is not in a state that can be activated.';
--     END IF;
-- END;
-- $$;